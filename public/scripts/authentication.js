const Authentication = (function () {
    //store the current user
    let user = null

    const getUser = function () {
        return user
    }

    //send signin to server
    const signin = function (name, password, onSuccsess, onError) {
        const data = {
            name: name,
            password: password
        }

        fetch("/signin", {
            "method": "Post",
            "headers": {
                "Content-type": "application/json"
            },
            "body": JSON.stringify(data)
        }).then((res) => res.json())
            .then((json) => {
                if (json.status == "success") {
                    user = json.user;
                    onSuccsess(user);
                } else {
                    onError(json.message);
                }
            }).catch((e) => {
                //console.log(e);
            })

    };
    const validate = function (onSuccess, onError) {
        fetch("/validate", {
            "method": "Get",
            "headers": { "Content-Type": "application/json" },
        }
        )
            .then((res) => res.json())
            .then((json) => {
                if (json.status == "success") {
                    user = json.user;
                    onSuccess(user);
                }
                else if (onError){
                    onError(json.message);
                }
                    
            })
            .catch((err) => {
                onError(err);
            });
    };
    const signout = function (onSuccess, onError) {

        fetch("/signout", {
            "method": "Get",
            "headers": { "Content-Type": "application/json" },
        }
        )
            .then((res) => res.json())
            .then((json) => {
                if (json.status == "success") {
                    user = null
                    onSuccess(json.message);
                }
                else if (onError) onError(json.message);
            })
            .catch((err) => {
                //console.log(err)
            });
    };
    //send signin to server
    const upload = function (formData, onSuccsess, onError) {
        //console.log(user,'want upload file')
        formData.append("uploader", getUser().name);
        fetch("/upload", {
            "method": "Post",
            "body": formData,
        }).then((res) => res.json())
            .then((json) => {
                if (json.status == "success") {
                    onSuccsess(json);
                    FilePanel.update()
                } else {
                    onError(json.message);
                }
            }).catch((e) => {
                //console.log(e);
            })

    };
    const getList = function (onSuccess) {
        fetch("/showfiles", {
            "method": "Get",
        }).then((res) => res.json())
            .then((json) => {
                if (json.status == "success") {
                    fileList = json.fileList;
                    onSuccess(fileList);
                }
            }).catch((e) => {
                //console.log(e);
            })
    };
    const deleteFile = function (id, onSuccsess, onError){
        if(user==null){
            alert("No permission")
            return
        }
        //console.log(user.name, 'want to delete file', id);
        const data = {
            id: id,
            name: user.name
        }

        fetch("/deletefile", {
            "method": "Post",
            "headers": {
                "Content-type": "application/json"
            },
            "body": JSON.stringify(data)
        }).then((res) => res.json())
            .then((json) => {
                if (json.status == "success") {
                    onSuccsess(json.message);
                    FilePanel.update()
                } else {
                    onError(json.message);
                }
            }).catch((e) => {
                //console.log(e);
            })

    }
    return { signin, signout, validate, getUser, upload, getList, deleteFile }
})();