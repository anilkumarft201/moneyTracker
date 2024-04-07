const userMap=new Map();
function setUser(id,user)
{
    userMap.set(id,user);
}
function getUser(id)
{
    return userMap.get(id);
}
function clearUser(user)
{
    return userMap.clear(user);
}
module.exports={
    setUser,getUser,clearUser
};