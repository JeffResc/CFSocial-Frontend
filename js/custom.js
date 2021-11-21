const endpoint = 'https://socialmedia-api-router.jeffresc.workers.dev/';
//const endpoint = 'http://127.0.0.1:8787/';

var last_fetch = '';

function react_post(post_id, react) {
    if (logged_in()) {
        const login = { username: SessionStorageHelper.get('username'), password: SessionStorageHelper.get('password') };
        $.ajax({
            type: 'POST',
            url: endpoint + 'react/' + post_id,
            data: JSON.stringify({ login: login, react: react }),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            mode: 'no-cors',
            success: function(data) {
                $('#' + react + '-' + post_id).text(data);
                console.log(data);
            },
            error: function(errMsg) {
                if (errMsg.status == 200) {
                    load_posts();
                } else {
                    alert('Error while reacting: ' + errMsg.responseText);
                }
            }
        });
    } else {
        alert('You must be logged in to react');
    }
}

function vote_post(post_id, vote) {
    if (logged_in()) {
        const login = { username: SessionStorageHelper.get('username'), password: SessionStorageHelper.get('password') };
        $.ajax({
            type: 'POST',
            url: endpoint + 'vote/' + post_id,
            data: JSON.stringify({ login: login, vote: vote }),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            mode: 'no-cors',
            success: function(data) {
                $('#vote-up-' + post_id).text(data.up);
                $('#vote-down-' + post_id).text(data.down);
            },
            error: function(errMsg) {
                if (errMsg.status == 200) {
                    load_posts();
                } else {
                    alert('Error while voting: ' + errMsg.responseText);
                }
            }
        });
    } else {
        alert('You must be logged in to vote');
    }
}

function login_display() {
    if (logged_in()) {
        $('#new-post-button').css('display', 'block');
        $('#login-button').css('display', 'none');
        $('#register-button').css('display', 'none');
        $('#logout-button').css('display', 'block');
    } else {
        $('#new-post-button').css('display', 'none');
        $('#login-button').css('display', 'block');
        $('#register-button').css('display', 'block');
        $('#logout-button').css('display', 'none');
    }
}

async function login_form() {
    if (typeof $('#login-username').val() !== 'undefined' && $('#login-username').val() !== '') {
        SessionStorageHelper.save('username', $('#login-username').val());
    } else {
        alert('Username is required');
        return;
    }
    if (typeof $('#login-password').val() !== 'undefined' && $('#login-password').val() !== '') {
        SessionStorageHelper.save('password', $('#login-password').val());
    } else {
        alert('Password is required');
        return;
    }
    if (logged_in()) {
        $.ajax({
            type: 'POST',
            url: endpoint + 'login',
            data: JSON.stringify({ username: SessionStorageHelper.get('username'), password: SessionStorageHelper.get('password') }),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            mode: 'no-cors',
            complete: function(data) {
                if (data.status === 200) {
                    login_display();
                    $('#loginModal').modal('hide');
                } else {
                    alert('Unable to login: ' + data.responseText);
                    logout();
                }
            }
        });
    }
}

async function register_form() {
    $.ajax({
        type: 'POST',
        url: endpoint + 'register',
        data: JSON.stringify({ username: $('#register-username').val(), password: $('#register-password').val() }),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        mode: 'no-cors',
        complete: function(data) {
            if (data.status === 200) {
                login_display();
                $('#registerModal').modal('hide');
                $('#login-username').val($('#register-username').val());
                $('#login-password').val($('#register-password').val());
                $('#register-username').val('');
                $('#register-password').val('');
                login_form();
            } else {
                alert('Unable to register: ' + data.responseText);
            }
        }
    });
}

function logged_in() {
    return (typeof SessionStorageHelper.get('username') !== 'undefined' && SessionStorageHelper.get('username') && typeof SessionStorageHelper.get('password') !== 'undefined' && SessionStorageHelper.get('password'));
}

function logout() {
    SessionStorageHelper.clear();
    $('#login-username').val('');
    $('#login-password').val('');
}

function clear_publish_post_form() {
    $('#post-title').val('');
    $('#post-username').val('');
    tinymce.get('post-content').setContent('');
}

function publish_post() {
    var post = {};
    post.login = { "username": SessionStorageHelper.get('username'), "password": SessionStorageHelper.get('password') };

    if ($('#post-title').val() !== '') {
        post.title = $('#post-title').val();
    } else {
        alert('Post title is required');
        return;
    }
    if (tinymce.get('post-content').getContent({ format: 'raw' }) !== '') {
        post.content = tinymce.get('post-content').getContent({ format: 'raw' });
    } else {
        alert('Post content is required');
        return;
    }

    $.ajax({
        type: 'POST',
        url: endpoint + 'posts',
        data: JSON.stringify(post),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        mode: 'no-cors',
        success: function(data) {
            clear_publish_post_form();
            load_posts();
            $('#postModal').modal('hide');
        },
        error: function(errMsg) {
            if (errMsg.status == 200) {
                clear_publish_post_form();
                load_posts();
                $('#postModal').modal('hide');
            } else {
                alert('Error while posting: ' + errMsg.responseText);
            }
        }
    });
}

function publish_comment(post_id) {
    var comment = {};
    comment.login = { "username": SessionStorageHelper.get('username'), "password": SessionStorageHelper.get('password') };

    if (tinymce.get('comment-field-' + post_id).getContent({ format: 'raw' }) !== '') {
        comment.content = tinymce.get('comment-field-' + post_id).getContent({ format: 'raw' });
    } else {
        alert('Comment content is required');
        return;
    }

    $.ajax({
        type: 'POST',
        url: endpoint + 'comment/' + post_id,
        data: JSON.stringify(comment),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        mode: 'no-cors',
        success: function(data) {
            $('#comment-field-' + post_id).val('');
            load_posts();
        },
        error: function(errMsg) {
            if (errMsg.status == 200) {
                $('#comment-field-' + post_id).val('');
                load_posts();
            } else {
                alert('Error while posting comment: ' + errMsg.responseText);
            }
        }
    });
}

function load_posts() {
    $.getJSON(endpoint + 'posts', function(data) {
        last_fetch = data;
        data.posts.sort((a, b) => ((a.votes.up.length - a.votes.down.length) < (b.votes.up.length - b.votes.down.length)) ? 1 : -1)
        var html = '';
        var users_own_posts = [];
        for (var i = 0; i < data.posts.length; i++) {
            if (logged_in() && data.posts[i].username == SessionStorageHelper.get('username')) {
                users_own_posts.push(data.posts[i]);
            }
            const published_date = new Date(data.posts[i].published_at);
            html += '<div class="col-lg-8">';
            html += '<article>';
            html += '<header class="mb-4">';
            html += '<h1 class="fw-bolder mb-1">' + data.posts[i].title + '</h1>';
            html += '<div class="text-muted fst-italic mb-2">Posted on ' + published_date.toLocaleString('en-US') + ' by ' + data.posts[i].username + '</div>';
            if (logged_in() && data.posts[i].username == SessionStorageHelper.get('username')) {
                html += '<div class="text-muted fst-italic mb-2"><a href="#" onclick="deletePost(' + data.posts[i].id + ')">Delete</a></div>';
            }
            html += '</header>';
            if (typeof data.posts[i].image !== 'undefined' && data.posts[i].image !== '' && data.posts[i].image !== null) {
                html += '<figure class="mb-4"><img class="img-fluid rounded" src="' + data.posts[i].image + '" /></figure>';
            }
            if (typeof data.posts[i].video !== 'undefined' && data.posts[i].video !== '' && data.posts[i].video !== null) {
                html += '<figure class="mb-4"><iframe width="420" height="315" src="' + data.posts[i].video + '"></iframe></figure>';
            }
            html += '<section class="mb-5">';
            html += data.posts[i].content;
            html += '</section>';
            html += '</article>';
            html += '<strong>React</strong>&nbsp;<button type="button" class="btn btn-primary" onclick="react_post(' + data.posts[i].id + ', \'like\');"><span id="like-' + data.posts[i].id + '">' + data.posts[i].reacts.like.length + '</span> 👍</button>';
            html += '&nbsp;&nbsp;';
            html += '<button type="button" class="btn btn-primary" onclick="react_post(' + data.posts[i].id + ', \'heart\');"><span id="heart-' + data.posts[i].id + '">' + data.posts[i].reacts.heart.length + '</span> 💖</button>';
            html += '&nbsp;&nbsp;';
            html += '<button type="button" class="btn btn-primary" onclick="react_post(' + data.posts[i].id + ', \'party\');"><span id="party-' + data.posts[i].id + '">' + data.posts[i].reacts.party.length + '</span> 🎉</button>';
            html += '&nbsp;&nbsp;';
            html += '<button type="button" class="btn btn-primary" onclick="react_post(' + data.posts[i].id + ', \'laugh\');"><span id="laugh-' + data.posts[i].id + '">' + data.posts[i].reacts.laugh.length + '</span> 😂</button>';
            html += '<br><br><strong>Vote</strong>&nbsp;<button type="button" class="btn btn-primary" onclick="vote_post(' + data.posts[i].id + ', \'up\');"><span id="vote-up-' + data.posts[i].id + '">' + data.posts[i].votes.up.length + '</span> ⬆️</button>';
            html += '&nbsp;&nbsp;';
            html += '<button type="button" class="btn btn-primary" onclick="vote_post(' + data.posts[i].id + ', \'down\');"><span id="vote-down-' + data.posts[i].id + '">' + data.posts[i].votes.down.length + '</span> ⬇️</button>';
            html += '&nbsp;&nbsp;';
            html += '<hr>';
            html += '<section class="mb-5">';
            html += '<div class="card bg-light">';
            html += '<div class="card-body">';
            if (logged_in()) {
                html += '<form class="mb-4"><textarea id="comment-field-' + data.posts[i].id + '" class="form-control comment-field" rows="3" placeholder="' + ((data.posts[i].comments.length == 0) ? ('Be the first to leave a comment!') : ('Leave a comment')) + '"></textarea></form>';
                html += '<button type="button" class="btn btn-primary" onclick="publish_comment(' + data.posts[i].id + ');">Post</button>';
                if (data.posts[i].comments.length > 0) {
                    html += '<hr>';
                }
            }
            for (var j = 0; j < data.posts[i].comments.length; j++) {
                const comment_published_date = new Date(data.posts[i].comments[j].published_at);
                html += '<div class="d-flex mb-4">';
                html += '<div class="ms-3">';
                html += '<div class="fw-bold">' + data.posts[i].comments[j].username + '</div>';
                html += '<div class="text-muted fst-italic mb-2">Posted on ' + comment_published_date.toLocaleString('en-US') + '</div>';
                html += '<div class="text-muted fst-italic mb-2"><a href="#" onclick="deleteComment(' + data.posts[i].id + ', ' + data.posts[i].comments[j].id + ')">Delete</a></div>';
                html += '<p>' + data.posts[i].comments[j].content + '</p>';
                html += '</div>';
                html += '</div>';
            }
            html += '</div>';
            html += '</section>';
            html += '</div>';
            if (i < data.posts.length - 1) {
                html += '<hr/>';
            }
        }
        if (html === '')
            html = '<p>No posts found.</p>';
        $('#posts').html(html);
        loadTINYMCE();
    });
}

function deletePost(id) {
    let c = confirm('Are you sure you want to delete this post?');
    if (c) {
        $.ajax({
            type: 'DELETE',
            url: endpoint + 'posts/' + id,
            data: JSON.stringify({ "login": { "username": SessionStorageHelper.get('username'), "password": SessionStorageHelper.get('password') } }),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            mode: 'no-cors',
            success: function(data) {
                load_posts();
            },
            error: function(errMsg) {
                if (errMsg.status == 200) {
                    load_posts();
                } else {
                    alert('Error while deleting post: ' + errMsg.responseText);
                }
            }
        });
    }
}

function deleteComment(post_id, comment_id) {
    let c = confirm('Are you sure you want to delete this comment?');
    if (c) {
        $.ajax({
            type: 'DELETE',
            url: endpoint + 'comment/' + post_id + '/' + comment_id,
            data: JSON.stringify({ "login": { "username": SessionStorageHelper.get('username'), "password": SessionStorageHelper.get('password') } }),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            mode: 'no-cors',
            success: function(data) {
                load_posts();
            },
            error: function(errMsg) {
                if (errMsg.status == 200) {
                    load_posts();
                } else {
                    alert('Error while deleting comment: ' + errMsg.responseText);
                }
            }
        });
    }
}

function loadTINYMCE() {
    for (var i = tinymce.editors.length - 1; i > -1; i--) {
        var ed_id = tinymce.editors[i].id;
        tinyMCE.execCommand("mceRemoveEditor", true, ed_id);
    }
    tinymce.init({
        selector: '#post-content',
        body_id: 'post-content-editor',
        toolbar: 'bold italic underline emoticons link image media table',
        plugins: 'emoticons image, table, link, imagetools, media',
        toolbar_mode: 'floating',
        menubar: false,
        branding: false
    });
    tinymce.init({
        selector: '.comment-field',
        body_id: 'post-content-editor',
        toolbar: 'bold italic underline emoticons link image media table',
        plugins: 'emoticons image, table, link, imagetools, media',
        toolbar_mode: 'floating',
        menubar: false,
        branding: false
    });
}

$(document).ready(function() {
    load_posts();
    login_display();

    $(document).on('focusin', function(e) {
        if ($(e.target).closest(".tox").length) {
            e.stopImmediatePropagation();
        }
    });
});