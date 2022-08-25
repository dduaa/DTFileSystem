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
            $("#login-area").show();
            $("#login-form")[0].reset();
            $("#login-message").text("");
            $("#register-area").hide();
        })
        $('#action_to_register').on('click', e => {
            $("#login-area").hide();
            $("#register-area").show();
            $("#register-form")[0].reset();
            $("#register-message").text("");
        });
        // Submit event for the signin form
        $("#login-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#signin-username").val().trim();
            const password = $("#signin-password").val().trim();
            //console.log(username,'want to login ')
            // Send a signin request
            Authentication.signin(username, password,
                (user) => {
                    //console.log(user,'login sucess');
                    loginHide();
                    registerHide();
                    UserPanel.show(user);
                    FilePanel.show();
                },
                (error) => { $("#login-message").text(error); }
            );
        });

        // Submit event for the register form
        $("#register-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const name = $("#register-username").val().trim();
            const avatar = $("#register-avatar").val();
            const password = $("#register-password").val().trim();
            const confirmPassword = $("#register-confirm").val().trim();
            //console.log(name, 'want to register ')
            // Password and confirmation does not match
            if (password !== confirmPassword) {
                $("#register-message").text("Passwords do not match.");
                return;
            }

            // Send a register request
            Register.register( name, password,avatar,
                (success) => {
                    $("#register-form")[0].reset();
                    $("#register-message").text("You can sign in now.");
                },
                (error) => { 
                    $("#register-message").text(error); 
                }
            );
        });

    };

    // This function shows the form
    const signinShow = function () {
        $("#login-area").show();
        $("#login-form")[0].reset();
        $("#login-message").text("");
        $("#register-area").hide();
    };
    const registerShow = function () {
        $("#register-area").show();
        $("#register-form")[0].reset();
        $("#register-message").text("");
        $("#login-area").hide();
    };

    const loginHide = function () {
        $("#login-form")[0].reset();
        $("#login-message").text("");
        $("#login-area").hide();
    };
    const registerHide = function () {
        $("#register-form")[0].reset();
        $("#register-message").text("");
        $("#register-area").hide();
    };

    return { initialize, signinShow, registerShow, loginHide, registerHide };
})();

const UserPanel = (function () {
    // This function initializes the UI
    const initialize = function () {
        // Hide it
        hide();

        // Click event for the signout button
        $("#signout-button").on("click", () => {
            // Send a signout request
            Authentication.signout(
                (e) => {
                    //console.log("sign out show singin")
                    hide();
                    FilePanel.hide();
                    SignInForm.signinShow();
                },
                ()=>{
                    //console.log("sign out fail")
                }
            );
        });

    };

    // This function shows the form with the user
    const show = function (user) {
        UI.getUserDisplay(user);
        $("#user-display").show();
        $("#signout-button").show();
        
    };

    // This function hides the form
    const hide = function () {
        $("#user-display").hide();
        $("#signout-button").hide();
        $("#signout-button").empty();
        $("#user-display").empty();
    };
    return { initialize, show, hide };
})();



const FilePanel = (function () {
    // This stores the file area
    let fileArea = null;
    let fileForm = null;
    let fileTB = null;

    // This function initializes the UI
    const initialize = function () {
        // Set up the file area
        fileArea = $("#file-area");
        fileForm = $("#upload-form")
        fileTB = $("#file-table-body");
        fileDown = $("#file-table-body");
        fileTB.empty();

        fileForm.on("submit", (e) => {
            e.preventDefault();

            let file = document.getElementById("file").files[0];
            let formData = new FormData();
            formData.append("file", file);
            const password = $("#fpassword").val().trim();
            formData.append("password", password);

            Authentication.upload(formData,
                (res) => {
                    $("#share-message").text(
                        res.filename + " " + res.message);
                    fileForm[0].reset();
                },
                (error) => { 
                    $("#share-message").text(error); 
                }
            )
        })
        


    };

    // This function updates the fileroom area
    const update = function () {
        Authentication.getList(
            (fileList)=>{
                fileTB.empty();
                for (var id in fileList){
                    file = fileList[id];

                    fileTB.append(
                        "<tr><td>"+
                        file.originalName
                        +"</td><td>"+
                        file.uploader
                        + "</td><td>" +
                        file.downloadCount
                        + "</td><td>" +
                        file.uploadTime
                        + "</td><td>" +
                        `<a href="/file/${id}" target="_blank"  class="btn left" >Download</a>`+
                        `<button id = "${id}" class="btn waves-effect red waves-light" type="button" name="action">Delete
                                <i class="material-icons right">clear</i>
                            </button>`
                        + "</td></tr>"
                    );
                    $(`#${id}`).on('click', e => {
                        let text = `You want to delete file: ${file.originalName}`;
                        if (confirm(text) == true) {
                            Authentication.deleteFile(id,
                                (success)=>{
                                    confirm(success)
                                },
                                (error)=>{
                                    confirm(error)
                                })
                        }
                    });
                }
            }
        )
    };
    const hide = function(){
        fileArea.hide()
        //fileDown[0].reset();
        $("#Download-message").text("");
    }
    const show = function () {
        fileForm[0].reset();
        $("#Download-message").text("");
        fileArea.show()
        update();
        console.log('file panel show and update')
    }
    return { initialize, update,hide, show };
})();

const UI = (function () {
    // This function gets the user display
    const getUserDisplay = function (user) {
        $("#user-display")
            .append($("<span class='user-avatar'>" +
                Avatar.getCode(user.avatar) + "</span>"))
            .append($("<span class='user-name'>" + user.name + "</span>"));
        $("#signout-button")
            .append($(`<span class="material-icons">logout</span>`));
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
