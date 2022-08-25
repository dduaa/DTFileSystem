# DTFileSystem
file sharing system with protection

component
1. login, register, logout, session validation
2. password hash
3. admin can delete all files, other users can only delete file they upload
4. if file is shared with a password, then no one can download if no valid password is presented
5. download count and upload time is recorded

supported with mongodb

demo page:
https://bit.ly/DTFSS


to-do:
1. compatiable with chinese character (file name)
2. add session cookie to keep alive, not just refresh and logout
