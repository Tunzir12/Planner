import React, { useState } from 'react'


import API from '../util/Api.jsx'


const User = ({ userId }) => {

  const { data: user, loading } = API.getUser(userId)

  if (loading)
    return (<div></div>)

  return (<div>{user.DisplayName}</div>)

}

export default User;
