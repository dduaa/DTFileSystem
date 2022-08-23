const Authentication =(function () {
    //store the current user
    let user = null

    const getUser = function(){
        return user
    }

    //send signin to server
    const sigin = function (name, password, onSuccsess, onError) {
        const data ={
            name:name,
            password:password
        }

        fetch("/signin",{
            "method":"Post",
            "headers":{
                "Content-type":"application/json"
            },
            "body":JSON.stringify(data)
        }).then((res)=>{
            let resJson = res.json();
            if (resJson.status=="success"){
                user = resJson.user;
                onSuccsess();
            }else{
                onError(resJson.error);
            }
        }).catch((e)=>{
            console.log(e);
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
                onSuccess();
            }
            else if (onError) 
                onError(json.error);
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
                onSuccess();
            }
            else if (onError) onError(json.error);
        })
        .catch((err) => {
            onError(err);
        });
    };
    return {sigin, signout, validate, getUser}
})();