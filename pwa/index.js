function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}


const applicationServerPublicKey = urlB64ToUint8Array('BH458YSQN1ZNGL-pdj-0Bxt-MJiDUMUdZxlaB8H_MRYOPJHbdKCeZREusbolzK1OeVJM8KsVIWDQrb5xe5EKhDQ');


if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./worker.js').then((registration) => {
            console.log('Service Worker registration completed with scope: ', registration.scope)
            registration.pushManager.getSubscription().then(function(sub) {
              if (sub === null) {
                // Update UI to ask user to register for Push
                console.log('Not subscribed to push service!');
                registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: applicationServerPublicKey
                }).then(async function(subs) {
                  console.log('Endpoint URL: ', subs.endpoint);
                  await fetch('http://localhost:8000/notification/subscribe', {
                    method: 'POST',
                    body: JSON.stringify(subs)
                  })

                }).catch(function(e) {
                  if (Notification.permission === 'denied') {
                    console.warn('Permission for notifications was denied');
                  } else {
                    console.error('Unable to subscribe to push', e);
                  }
                });
              } else {
                // We have a subscription, update the database
                console.log('Subscription object: ', sub);
              }
            });
        }, (err) => {
            console.log('Service Worker registration failed', err)
        })
    })
} else {
    console.log('Service Workers not supported')
}


if (!('Notification' in window)) {
  console.log('This browser does not support notifications!');
} else {
  Notification.requestPermission(status => {
    console.log('Notification permission status:', status);
  });
}

if (Notification.permission == 'granted') {
  navigator.serviceWorker.getRegistration().then(reg => {

    // TODO 2.4 - Add 'options' object to configure the notification
    // reg.pushManager.subscribe({userVisibleOnly: true}).then(subs => {
    //   console.log(subs);
    //   reg.showNotification('Hello world!');
    // })
    
  });
}


$("#username-changer").on('click', () => {
    $("#username-changer").text(faker.internet.userName());
})

$("#new-post").on('click', () => {
  $('#post-modal').modal('show')
})

$(document).ready(function () { // TODO check like status
    $("#username-changer").text(faker.internet.userName());
    postsLoader();
});

$('body').on('click', ".like-post", function () { // TODO send post
    let postId = $(this).attr('id').split("-").slice(-1).pop();
    let username = $("#username-changer").text();
    $(this).removeClass("text-secondary")
    $(this).addClass("text-primary")
    addPostLike(postId, username);
})


$('body').on('click', ".like-post-show", function () {
  let postId = $(this).attr('id').split("-").slice(-1).pop();
  getPostLikes(postId);
    $('#likes-modal').modal('show')
})
$('body').on('click',".comment-post-show", function () {

    let postId = $(this).attr('id').split("-").slice(-1).pop();
    getPostComments(postId)
    $(`#comment-collapse-${postId}`).collapse("toggle");
})

$('body').on('click',".post-commentary", function () {
  let postId = $(this).attr('id').split("-").slice(-1).pop();
  let content = $(`#comment-content-${postId}`).val()
  let username = $("#username-changer").text();
  addPostCommentary(postId, username, content);
  $(`#comment-content-${postId}`).val('');
  
})


$('body').on('click',"#submit-post", function () {
  let content = $(`#post-content`).val()
  let username = $("#username-changer").text();
  addNewPost(username, content);
  $('#post-modal').modal('hide')
})

const postsLoader = () => {
  const postContainer = $("#post-container");
  let postHTML, content, id, timestamp, likeCount, commentCount, username;
  let posts = fetchGetter("http://localhost:8000/posts/").then(posts => {
    postContainer.empty();
    posts.reverse().forEach((post) => {
      // console.log(post);
      content = post.content;
      id = post.id;
      timestamp = moment(post.timestamp).format('llll');
      likeCount = post.like_count;
      commentCount = post.comment_count;
      username = post.username;
      postHTML=`<div class="card mt-3"> <div class="card-body"> <h5 class="card-title">${username}</h5><p class="card-text">${content}</p><div class="row"> <a href="#" class="text-secondary like-post" id="like-post-${id}"> <i class="mx-3 fa fa-thumbs-o-up"></i> </a> <a href="#"class="text-secondary like-post-show" id="like-post-show-users-${id}">${likeCount}</a> <a href="#" class="text-secondary comment-post" id="comment-post-${id}"> <i class="mx-3 fa fa-comments-o"></i> </a> <a href="#" class="text-secondary comment-post-show" id="comment-post-show-users-${id}">${commentCount}</a> <div class="ml-auto mr-3">${timestamp}</div></div><hr> <div class="collapse" id="comment-collapse-${id}"> <div class="card card-body"> <ul class="list-group" id="comment-list-group-${id}"> </ul> </div></div><form> <div class="input-group mt-3"> <input type="text" class="form-control" id="comment-content-${id}" placeholder="Comment"> <div class="input-group-append"> <button type="button" class="post-commentary btn btn-primary" id="submit-commentary-${id}" class="btn btn-primary">Submit</button> </div></div></form> </div></div>`;
      postContainer.append(postHTML);
    })
  })  
}


const fetchGetter = async (url) => {
    let response = await fetch(`${url}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    let data = await response.json()
    return data
}

const fetchPoster = async (url, body) => {
  const rawResponse = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  return rawResponse;
  // const content = await rawResponse.json();
  // return content;
}


const getPostComments = (postId) => {
    let url = `http://localhost:8000/comments/${postId}`;
    const postListGroup = $(`#comment-list-group-${postId}`)
    let data = fetchGetter(url).then(data => {
      postListGroup.empty();
      $(`#comment-post-show-users-${postId}`).text(data.length);
      data.forEach(comment => {
        postListGroup.append(`<li class="list-group-item">
        <span class="font-weight-bold mb-3">${comment.fields.username}</span>
        <p class="mt-3">${comment.fields.content}</p>
        <span class="ml-auto mr-3 font-weight-light">${moment(comment.fields.timestamp).format('llll')}</span>
        </li>`)
      })
    });
}

const getPostLikes = (postId) => {
  let url = `http://localhost:8000/likes/${postId}`;
  const postListGroup = $(`#likes-list`)
  postListGroup.empty();
  let data = fetchGetter(url).then(data => {
    data.forEach(comment => {
      postListGroup.append(`<li class="list-group-item">${comment.fields.username}</li>`)
    })
  });
}

const addPostLike = (postId, username) => {
  const url = 'http://localhost:8000/likes/new';
  const body = {"post_id":postId,"username": username};
  fetchPoster(url, body).then(res => {
    if (res.status == 200) {
      var likes = Number($(`#like-post-show-users-${postId}`).text()) + 1; 
      $(`#like-post-show-users-${postId}`).text(likes);
    }
  });;
}


const addPostCommentary = (postId, username, content) => {
  const url = 'http://localhost:8000/comments/new';
  const body = {"post_id":postId,"content":content,"username":username};
  fetchPoster(url, body).then(_ => {
    getPostComments(postId)
  });;
}


const addNewPost = (username, content) => {
  const url = 'http://localhost:8000/posts/new';
  const body = {"content":content,"username":username};
  fetchPoster(url, body).then(_ => {
    postsLoader()
  });
}