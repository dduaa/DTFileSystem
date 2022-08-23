const Register =(function(){
    /*
    register require:
        1. name
        2. password
        3. select avatar
    // * `onSuccess` - This is a callback function to be called when the
    //                 request is successful in this form `onSuccess()`
    // * `onError`   - This is a callback function to be called when the
    //                 request fails in this form `onError(error)`
    */
    const register = function (name, password, avatar, onSuccess, onError) {
        const userInfo = {
            "name": name,
            "avatar": avatar,
            "password": password
        };

        fetch("/register", {
            "method": "Post",
            "headers": { "Content-Type": "application/json" },
            "body": JSON.stringify(userInfo)
        })
        .then((res) => {
            let json = res.json();
            if (json.status == "success") {
                /* Run the onSuccess() callback */
                onSuccess(json.success);
            } else if (onError){
                onError(json.error);
            } 
        })
        return { register };
   }
})();
