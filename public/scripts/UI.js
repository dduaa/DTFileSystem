const SignInForm = (function () {
    // This function initializes the UI
    const initialize = function () {
        // Populate the avatar selection
        Avatar.populate($("#register-avatar"));
        
        // Hide it
        $("#login-area").hide();
        $("#register-area").show();

        $('#action_login').on('click', e => {
            $("#login-area").show();
            $("#register-area").hide();
        })
        $('#action_to_register').on('click', e => {
            $("#login-area").hide();
            $("#register-area").show();
        });
        // Submit event for the signin form
        $("#login-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#signin-username").val().trim();
            const password = $("#signin-password").val().trim();
            console.log(username, password,'want to login ')
            // Send a signin request
            Authentication.signin(username, password,
                () => {
                    hide();
                    UserPanel.update(Authentication.getUser());
                    UserPanel.show();
                },
                (error) => { $("#signin-message").text(error); }
            );
        });

        // Submit event for the register form
        $("#register-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();
            console.log("45")

            // Get the input fields
            const name = $("#register-username").val().trim();
            const avatar = $("#register-avatar").val();
            const password = $("#register-password").val().trim();
            const confirmPassword = $("#register-confirm").val().trim();
            console.log(name, password, 'want to reg ')
            // Password and confirmation does not match
            if (password !== confirmPassword) {
                $("#register-message").text("Passwords do not match.");
                return;
            }

            // Send a register request
            Register.register( name, password,avatar,
                () => {
                    $("#register-form").get(0).reset();
                    $("#register-message").text("You can sign in now.");
                },
                (error) => { $("#register-message").text(error); }
            );
        });

    };

    // This function shows the form
    const show = function () {
        $("#signin-overlay").fadeIn(500);
    };

    // This function hides the form
    const hide = function () {
        $("#signin-form").get(0).reset();
        $("#signin-message").text("");
        $("#register-message").text("");
        $("#signin-overlay").fadeOut(500);
    };

    return { initialize, show, hide };
})();

const UserPanel = (function () {
    // This function initializes the UI
    const initialize = function () {
        // Hide it
        $("#user-panel").hide();

        // Click event for the signout button
        $("#signout-button").on("click", () => {
            // Send a signout request
            Authentication.signout(
                () => {
                    hide();
                    SignInForm.show();
                }
            );
        });

    };

    // This function shows the form with the user
    const show = function (user) {
        $("#user-panel").show();
    };

    // This function hides the form
    const hide = function () {
        $("#user-panel").hide();
    };

    // This function updates the user panel
    const update = function (user) {
        if (user) {
            $("#user-panel .user-avatar").html(Avatar.getCode(user.avatar));
            $("#user-panel .user-name").text(user.name);
        }
        else {
            $("#user-panel .user-avatar").html("");
            $("#user-panel .user-name").text("");
        }
    };

    return { initialize, show, hide, update };
})();



const FilePanel = (function () {
    // This stores the file area
    let fileArea = null;

    // This function initializes the UI
    const initialize = function () {
        // Set up the file area
        fileArea = $("#file-area");
        // Submit event for the input form
    };

    // This function updates the fileroom area
    const update = function (fileroom) {
        // Clear the online users area
        fileArea.empty();
    };

    let counter = setTimeout(() => { $("#typing-message").text(""); }, 3000);
    const addTypingMessage = function (user, user2) {

        const currentUser = Authentication.getUser();
        if (user.name == currentUser.name) {
            return;
        }
        $("#typing-message").text(user.name + "is requesting..." + user2);
        clearTimeout(counter);
        counter = setTimeout(() => { $("#typing-message").text(""); }, 3000);
    };



    return { initialize, update, };
})();

const UI = (function () {
    // This function gets the user display
    const getUserDisplay = function (user) {
        return $("<div class='field-content row shadow'></div>")
            .append($("<span class='user-avatar'>" +
                Avatar.getCode(user.avatar) + "</span>"))
            .append($("<span class='user-name'>" + user.name + "</span>"));
    };

    // The components of the UI are put here
    const components = [SignInForm, UserPanel, FilePanel];

    // This function initializes the UI
    const initialize = function () {
        // Initialize the components
        for (const component of components) {
            component.initialize();
        }
    };

    return { getUserDisplay, initialize };
})();
