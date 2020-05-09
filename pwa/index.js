if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./worker.js').then((registration) => {
            console.log('Service Worker registration completed with scope: ', registration.scope)
        }, (err) => {
            console.log('Service Worker registration failed', err)
        })
    })
} else {
    console.log('Service Workers not supported')
}

fetch('http://localhost:8000/posts/', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
}).then(function (response) {
    if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' + response.status);
        // console.log(response);
        return;
    }

    // Examine the text in the response
    response.json().then(function (data) {
        console.log(data);
    });
}).catch(function (err) {
    console.log('Fetch Error :-S', err);
});

$("#username-changer").click(() => {
    $("#username-changer").text(faker.internet.userName());
})

$(document).ready(function () { // TODO check like status
    $("#username-changer").text(faker.internet.userName());
});

$(".like-post").click(function () { // TODO send post
    let postId = $(this).attr('id').split("-").slice(-1).pop();
    let username = $("#username-changer").text();
    $(this).removeClass("text-secondary")
    $(this).addClass("text-primary")
    addPostLike(postId, username);
})


$(".like-post-show").click(function () {
  let postId = $(this).attr('id').split("-").slice(-1).pop();
  getPostLikes(postId);
    $('#likes-modal').modal('show')
})
$(".comment-post-show").click(function () {

    let postId = $(this).attr('id').split("-").slice(-1).pop();
    getPostComments(postId)
    $(`#comment-collapse-${postId}`).collapse("toggle");
})

$(".post-commentary").click(function () {
  let postId = $(this).attr('id').split("-").slice(-1).pop();
  let content = $(`#comment-content-${postId}`).val()
  let username = $("#username-changer").text();
  addPostCommentary(postId, username, content);
  $(`#comment-content-${postId}`).val('');
})


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
  // const content = await rawResponse.json();
  // return content;
}


const getPostComments = (postId) => {
    let url = `http://localhost:8000/comments/${postId}`;
    const postListGroup = $(`#comment-list-group-${postId}`)
    postListGroup.empty();
    let data = fetchGetter(url).then(data => {
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
  fetchPoster(url, body);
}


const addPostCommentary = (postId, username, content) => {
  const url = 'http://localhost:8000/comments/new';
  const body = {"post_id":postId,"content":content,"username":username};
  fetchPoster(url, body);
}