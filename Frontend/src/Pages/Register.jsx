import React from 'react'

const Register = () => {
  return (
    <div className="max-w-md mx-auto mt-16 p-6 border rounded shadow">
      <h1 className="text-2xl font-semibold mb-4">Register</h1>
      <form>
        <label className="block mb-2">Username</label>
        <input className="w-full mb-3 p-2 border rounded" />
        <label className="block mb-2">Email</label>
        <input className="w-full mb-3 p-2 border rounded" />
        <label className="block mb-2">Password</label>
        <input type="password" className="w-full mb-3 p-2 border rounded" />
        <button type="button" className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">Create account</button>
      </form>
    </div>
  )
}

export default Register
