//Set current endpoint
const endpoint = 'https://cfsocial.jeffresc.dev/api/';
//const endpoint = 'http://127.0.0.1:8787/';

// Function for when a user clicks a react button
function react_post(post_id, react) {
    // Ensure user is logged in
    if (logged_in()) {
        // Get the current user
        const login = { username: SessionStorageHelper.get('username'), password: SessionStorageHelper.get('password') };
        // Send the request to the server
        $.ajax({
            type: 'POST',
            url: endpoint + 'react/' + post_id,
            data: JSON.stringify({ login: login, react: react }),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            mode: 'no-cors',
            success: function(data) {
                // Update the react count
                $('#' + react + '-' + post_id).text(data);
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

// Function for when a user clicks the vote button
function vote_post(post_id, vote) {
    // Ensure user is logged in
    if (logged_in()) {
        // Get the current user
        const login = { username: SessionStorageHelper.get('username'), password: SessionStorageHelper.get('password') };
        // Send the request to the server
        $.ajax({
            type: 'POST',
            url: endpoint + 'vote/' + post_id,
            data: JSON.stringify({ login: login, vote: vote }),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            mode: 'no-cors',
            success: function(data) {
                // Update the vote count
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

// Function that updates the naviagation bar depending on the user's login status
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

// Function for when users submit the login form
async function login_form() {
    // Ensure username is not empty, save it to session storage
    if (typeof $('#login-username').val() !== 'undefined' && $('#login-username').val() !== '') {
        SessionStorageHelper.save('username', $('#login-username').val());
    } else {
        alert('Username is required');
        return;
    }
    // Ensure password is not empty, save it to session storage
    if (typeof $('#login-password').val() !== 'undefined' && $('#login-password').val() !== '') {
        SessionStorageHelper.save('password', $('#login-password').val());
    } else {
        alert('Password is required');
        return;
    }
    // Ensure user is logged in
    if (logged_in()) {
        // Send the request to the server
        $.ajax({
            type: 'POST',
            url: endpoint + 'login',
            data: JSON.stringify({ username: SessionStorageHelper.get('username'), password: SessionStorageHelper.get('password') }),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            mode: 'no-cors',
            complete: function(data) {
                if (data.status === 200) {
                    // Update the naviagation bar
                    login_display();
                    // (Re)load the posts
                    load_posts();
                    // Hide the login modal
                    $('#loginModal').modal('hide');
                } else {
                    alert('Unable to login: ' + data.responseText);
                    logout();
                }
            }
        });
    }
}

// Function for when users submit the register form
async function register_form() {
    // Send the request to the server
    $.ajax({
        type: 'POST',
        url: endpoint + 'register',
        data: JSON.stringify({ username: $('#register-username').val(), password: $('#register-password').val() }),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        mode: 'no-cors',
        complete: function(data) {
            if (data.status === 200) {
                // Update the naviagation bar
                login_display();
                // Hide the register modal
                $('#registerModal').modal('hide');
                // After successful registration, login the user
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

// Simple local check to see if the user is logged in, does not query the server for validity
function logged_in() {
    return (typeof SessionStorageHelper.get('username') !== 'undefined' && SessionStorageHelper.get('username') && typeof SessionStorageHelper.get('password') !== 'undefined' && SessionStorageHelper.get('password'));
}

// Function for when users click the logout button
function logout() {
    SessionStorageHelper.clear();
    $('#login-username').val('');
    $('#login-password').val('');
}

// Function to clear the publish post form
function clear_publish_post_form() {
    $('#post-title').val('');
    $('#post-username').val('');
    tinymce.get('post-content').setContent('');
}

// Function for when the user clicks the publish post button
function publish_post() {
    // Initialize the post object
    var post = {};
    // Add the user login information
    post.login = { "username": SessionStorageHelper.get('username'), "password": SessionStorageHelper.get('password') };

    // Ensure the title is not empty
    if ($('#post-title').val() !== '') {
        post.title = $('#post-title').val();
    } else {
        alert('Post title is required');
        return;
    }
    // Ensure the content is not empty
    if (tinymce.get('post-content').getContent({ format: 'raw' }) !== '') {
        post.content = tinymce.get('post-content').getContent({ format: 'raw' });
    } else {
        alert('Post content is required');
        return;
    }

    // Send the request to the server
    $.ajax({
        type: 'POST',
        url: endpoint + 'posts',
        data: JSON.stringify(post),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        mode: 'no-cors',
        success: function(data) {
            // Clear the publish post form
            clear_publish_post_form();
            // (Re)load the posts
            load_posts();
            // Hide the publish post modal
            $('#postModal').modal('hide');
        },
        error: function(errMsg) {
            if (errMsg.status == 200) {
                // Clear the publish post form
                clear_publish_post_form();
                // (Re)load the posts
                load_posts();
                // Hide the publish post modal
                $('#postModal').modal('hide');
            } else {
                alert('Error while posting: ' + errMsg.responseText);
            }
        }
    });
}

// Function for when the user publishes a comment
function publish_comment(post_id) {
    // Initialize the comment object
    var comment = {};
    // Add the user login information
    comment.login = { "username": SessionStorageHelper.get('username'), "password": SessionStorageHelper.get('password') };

    // Ensure the comment is not empty
    if (tinymce.get('comment-field-' + post_id).getContent({ format: 'raw' }) !== '') {
        comment.content = tinymce.get('comment-field-' + post_id).getContent({ format: 'raw' });
    } else {
        alert('Comment content is required');
        return;
    }

    // Send the request to the server
    $.ajax({
        type: 'POST',
        url: endpoint + 'comment/' + post_id,
        data: JSON.stringify(comment),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        mode: 'no-cors',
        success: function(data) {
            // Empty the comment field
            $('#comment-field-' + post_id).val('');
            // (Re)load the posts
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

// Function to load the posts from the server
function load_posts() {
    // Send the request to the server
    $.getJSON(endpoint + 'posts', function(data) {
        // Sort posts by votes
        data.posts.sort((a, b) => ((a.votes.up.length - a.votes.down.length) < (b.votes.up.length - b.votes.down.length)) ? 1 : -1);
        // Initialize an empty HTML string
        var html = '';
        // For each post
        for (var i = 0; i < data.posts.length; i++) {
            // Create a date from the post date
            const published_date = new Date(data.posts[i].published_at);
            // Start the post HTML
            html += '<div class="col-lg-8">';
            html += '<article>';
            html += '<header class="mb-4">';
            // Add the title
            html += '<h1 class="fw-bolder mb-1">' + data.posts[i].title + '</h1>';
            // Add the date and username
            html += '<div class="text-muted fst-italic mb-2">Posted on ' + published_date.toLocaleString('en-US') + ' by ' + data.posts[i].username + '</div>';
            // If logged in and the user is the author, add the delete button
            if (logged_in() && data.posts[i].username == SessionStorageHelper.get('username')) {
                html += '<div class="text-muted fst-italic mb-2"><a href="#" onclick="deletePost(' + data.posts[i].id + ')">Delete</a></div>';
            }
            html += '</header>';
            html += '<section class="mb-5">';
            // Add the content
            html += data.posts[i].content;
            html += '</section>';
            html += '</article>';
            // Add the react buttons
            html += '<strong>React</strong>&nbsp;<button type="button" class="btn btn-primary" onclick="react_post(' + data.posts[i].id + ', \'like\');"><span id="like-' + data.posts[i].id + '">' + data.posts[i].reacts.like.length + '</span> 👍</button>';
            html += '&nbsp;&nbsp;';
            html += '<button type="button" class="btn btn-primary" onclick="react_post(' + data.posts[i].id + ', \'heart\');"><span id="heart-' + data.posts[i].id + '">' + data.posts[i].reacts.heart.length + '</span> 💖</button>';
            html += '&nbsp;&nbsp;';
            html += '<button type="button" class="btn btn-primary" onclick="react_post(' + data.posts[i].id + ', \'party\');"><span id="party-' + data.posts[i].id + '">' + data.posts[i].reacts.party.length + '</span> 🎉</button>';
            html += '&nbsp;&nbsp;';
            html += '<button type="button" class="btn btn-primary" onclick="react_post(' + data.posts[i].id + ', \'laugh\');"><span id="laugh-' + data.posts[i].id + '">' + data.posts[i].reacts.laugh.length + '</span> 😂</button>';
            // Add the vote buttons
            html += '<br><br><strong>Vote</strong>&nbsp;<button type="button" class="btn btn-primary" onclick="vote_post(' + data.posts[i].id + ', \'up\');"><span id="vote-up-' + data.posts[i].id + '">' + data.posts[i].votes.up.length + '</span> ⬆️</button>';
            html += '&nbsp;&nbsp;';
            html += '<button type="button" class="btn btn-primary" onclick="vote_post(' + data.posts[i].id + ', \'down\');"><span id="vote-down-' + data.posts[i].id + '">' + data.posts[i].votes.down.length + '</span> ⬇️</button>';
            html += '&nbsp;&nbsp;';
            html += '<hr>';
            html += '<section class="mb-5">';
            html += '<div class="card bg-light">';
            html += '<div class="card-body">';
            // If user is logged in, add the comment field
            if (logged_in()) {
                html += '<form class="mb-4"><textarea id="comment-field-' + data.posts[i].id + '" class="form-control comment-field" rows="3" placeholder="' + ((data.posts[i].comments.length == 0) ? ('Be the first to leave a comment!') : ('Leave a comment')) + '"></textarea></form>';
                html += '<button type="button" class="btn btn-primary" onclick="publish_comment(' + data.posts[i].id + ');">Post</button>';
                if (data.posts[i].comments.length > 0) {
                    html += '<hr>';
                }
            }
            // Add the comments
            for (var j = 0; j < data.posts[i].comments.length; j++) {
                // Add the published date
                const comment_published_date = new Date(data.posts[i].comments[j].published_at);
                html += '<div class="d-flex mb-4">';
                html += '<div class="ms-3">';
                // Add the username
                html += '<div class="fw-bold">' + data.posts[i].comments[j].username + '</div>';
                html += '<div class="text-muted fst-italic mb-2">Posted on ' + comment_published_date.toLocaleString('en-US') + '</div>';
                // If user is logged in and the user is the author, add the delete button
                if (logged_in() && data.posts[i].comments[j].username == SessionStorageHelper.get('username')) {
                    html += '<div class="text-muted fst-italic mb-2"><a href="#" onclick="deleteComment(' + data.posts[i].id + ', ' + data.posts[i].comments[j].id + ')">Delete</a></div>';
                }
                // Show comment content
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
        // If no posts, show a message
        if (html === '')
            html = '<p>No posts found.</p>';
        $('#posts').html(html);
        // Now that the HTML is loaded, add the text editor(s)
        loadTINYMCE();
    });
}

// Function to delete the post
function deletePost(id) {
    // Confirm the deletion
    let c = confirm('Are you sure you want to delete this post?');
    if (c) {
        // Request the deletion from the server
        $.ajax({
            type: 'DELETE',
            url: endpoint + 'posts/' + id,
            data: JSON.stringify({ "login": { "username": SessionStorageHelper.get('username'), "password": SessionStorageHelper.get('password') } }),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            mode: 'no-cors',
            success: function(data) {
                // If the deletion was successful, reload the posts
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

// Function to delete a comment
function deleteComment(post_id, comment_id) {
    // Confirm the deletion
    let c = confirm('Are you sure you want to delete this comment?');
    if (c) {
        // Request the deletion from the server
        $.ajax({
            type: 'DELETE',
            url: endpoint + 'comment/' + post_id + '/' + comment_id,
            data: JSON.stringify({ "login": { "username": SessionStorageHelper.get('username'), "password": SessionStorageHelper.get('password') } }),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            mode: 'no-cors',
            success: function(data) {
                // If the deletion was successful, reload the posts
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

// Initialize the TinyMCE editor(s)
function loadTINYMCE() {
    // Delete the existing editor(s)
    for (var i = tinymce.editors.length - 1; i > -1; i--) {
        var ed_id = tinymce.editors[i].id;
        tinyMCE.execCommand("mceRemoveEditor", true, ed_id);
    }
    // Initialize the publish post editor
    tinymce.init({
        selector: '#post-content',
        body_id: 'post-content-editor',
        toolbar: 'bold italic underline emoticons link image media table',
        plugins: 'emoticons image, table, link, imagetools, media',
        toolbar_mode: 'floating',
        menubar: false,
        branding: false
    });
    // Initialize the publish comment editor
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

// When the webpage is loaded and ready
$(document).ready(function() {
    // Load posts
    load_posts();
    // Show/hide naviation buttons depending on user login status
    login_display();

    // Allows TinyMCE to be focused on when using Bootstrap modals
    // Thank you EternalHour on StackOverflow
    // https://stackoverflow.com/a/26880625/5871303
    $(document).on('focusin', function(e) {
        if ($(e.target).closest(".tox").length) {
            e.stopImmediatePropagation();
        }
    });
});