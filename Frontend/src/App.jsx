import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ChatBox from './components/ChatBox'

function App() {
  const navigate = useNavigate()
  const [count, setCount] = useState(0)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isStoreOpen, setIsStoreOpen] = useState(false)
  const [stores, setStores] = useState([])
  const [user, setUser] = useState(null)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isSignupOpen, setIsSignupOpen] = useState(false)
  const [isStoreSetupOpen, setIsStoreSetupOpen] = useState(false)
  const [selectedStore, setSelectedStore] = useState(null)
  const [isStoreDetailsOpen, setIsStoreDetailsOpen] = useState(false)
  const [medicineSearch, setMedicineSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loginData, setLoginData] = useState({ email: '', password: '', role: 'patient' })
  const [signupData, setSignupData] = useState({ email: '', password: '', role: 'patient' })
  const [storeData, setStoreData] = useState({ name: '', address: '', contact: '', gstNo: '' })


  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  useEffect(() => {
    if (isStoreOpen) {
      const token = localStorage.getItem('token')
      fetch('http://localhost:8000/api/stores', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
        .then((res) => {
          if (res.ok) {
            return res.json()
          } else {
            throw new Error(`Failed to fetch stores: ${res.status}`)
          }
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setStores(data)
          } else {
            setStores([])
          }
        })
        .catch((err) => {
          console.error('Failed to fetch stores:', err)
          setStores([])
        })
    }
  }, [isStoreOpen])

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      })
      const data = await res.json()
      if (res.ok) {
        if (data.user.role !== loginData.role) {
          alert('Role mismatch. Please login with the correct role.')
          return
        }
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        setUser(data.user)
        setIsLoginOpen(false)
        setLoginData({ email: '', password: '', role: 'patient' })
      } else {
        alert(data.message)
      }
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('http://localhost:8000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData)
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        setUser(data.user)
        setIsSignupOpen(false)
        setSignupData({ email: '', password: '', role: 'patient' })
      } else {
        alert(`Signup failed: ${data.message}`)
      }
    } catch (err) {
      console.error('Signup failed:', err)
    }
  }

  const handleStoreSetup = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:8000/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(storeData)
      })
      const data = await res.json()
      if (res.ok) {
        alert('Store created successfully!')
        setIsStoreSetupOpen(false)
        setStoreData({ name: '', address: '', contact: '', gstNo: '' })
        // Refresh the store list immediately
        setIsStoreOpen(false) // close modal first
        setTimeout(() => {
          setIsStoreOpen(true) // reopen modal to refresh list
          fetch('http://localhost:8000/api/stores')
            .then((res) => res.json())
            .then((data) => setStores(data))
            .catch((err) => console.error('Failed to fetch stores:', err))
        }, 100)
      } else {
        alert(data.message)
      }
    } catch (err) {
      console.error('Store creation failed:', err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const handleStoreClick = (store) => {
    setSelectedStore(store)
    setIsStoreOpen(false)
    setIsStoreDetailsOpen(true)
  }

  const [manualSearch, setManualSearch] = useState('')

  const handleSearchChange = (e) => {
    setManualSearch(e.target.value)
  }

  const handleSearchSubmit = async (e) => {
    e.preventDefault()
    const query = manualSearch.trim()
    setMedicineSearch(query)

    if (query === '') {
      setSearchResults([])
      return
    }

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:8000/api/medicines/search/${selectedStore._id}?query=${encodeURIComponent(query)}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      if (res.ok) {
        const results = await res.json()
        setSearchResults(results)
      } else {
        setSearchResults([])
      }
    } catch (err) {
      console.error('Search failed:', err)
      setSearchResults([])
    }
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-4 right-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 z-50"
      >
        💬
      </button>

      {/* Chat Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-2xl">
              <h2 className="text-xl font-bold">Medicine AI Chatbot</h2>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <ChatBox />
            </div>
          </div>
        </div>
      )}

      {/* User Authentication Buttons */}
      {!user && (
        <div className="fixed top-4 right-4 space-x-2 z-50">
          <button
            onClick={() => setIsLoginOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
          <button
            onClick={() => setIsSignupOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Signup
          </button>
        </div>
      )}

      {/* Logout Button */}
      {user && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      )}

      {/* Login Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold mb-4">Login</h2>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                className="w-full mb-3 p-2 border rounded"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="w-full mb-3 p-2 border rounded"
                required
              />
              <select
                value={loginData.role}
                onChange={(e) => setLoginData({ ...loginData, role: e.target.value })}
                className="w-full mb-3 p-2 border rounded"
                required
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="medicine_store">Medicine Store</option>
              </select>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
              >
                Login
              </button>
            </form>
            <button
              onClick={() => {
                setIsLoginOpen(false)
                setIsSignupOpen(true)
              }}
              className="mt-4 text-blue-600 underline"
            >
              Don't have an account? Signup
            </button>
            <button
              onClick={() => setIsLoginOpen(false)}
              className="mt-2 text-gray-600 underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {isSignupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold mb-4">Signup</h2>
            <form onSubmit={handleSignup}>
              <input
                type="email"
                placeholder="Email"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                className="w-full mb-3 p-2 border rounded"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                className="w-full mb-3 p-2 border rounded"
                required
              />
              <select
                value={signupData.role}
                onChange={(e) => setSignupData({ ...signupData, role: e.target.value })}
                className="w-full mb-3 p-2 border rounded"
                required
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="medicine_store">Medicine Store</option>
              </select>
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
              >
                Signup
              </button>
            </form>
            <button
              onClick={() => {
                setIsSignupOpen(false)
                setIsLoginOpen(true)
              }}
              className="mt-4 text-green-600 underline"
            >
              Already have an account? Login
            </button>
            <button
              onClick={() => setIsSignupOpen(false)}
              className="mt-2 text-gray-600 underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

{/* Medicine Store Button */}
{user && user.role === 'medicine_store' && (
  <button
    onClick={() => navigate('/medicine-dashboard')}
    className="fixed bottom-20 right-4 bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 z-50"
  >
    🏥 My Store
  </button>
)}

{(!user || user.role !== 'medicine_store') && (
  <button
    onClick={() => setIsStoreOpen(true)}
    className="fixed bottom-20 right-4 bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 z-50"
  >
    🏥 Medicine Stores
  </button>
)}

      {/* Medicine Store Modal */}
      {isStoreOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 bg-green-600 text-white rounded-t-2xl">
              <h2 className="text-xl font-bold">Medicine Stores</h2>
              <button
                onClick={() => setIsStoreOpen(false)}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-4">
{user && user.role === 'medicine_store' && (
  <>
    {!stores.length ? (
      <button
        onClick={() => {
          setIsStoreOpen(false)
          setIsStoreSetupOpen(true)
        }}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Set Up My Store
      </button>
    ) : (
      <p>You already have a store set up.</p>
    )}
  </>
)}
{user && user.role === 'medicine_store' ? (
  <p>You are logged in as a medicine store owner.</p>
) : stores.length === 0 ? (
  <p>No stores available.</p>
) : (
  <ul>
    {stores.map((store) => (
      <li
        key={store.id}
        className="mb-4 border-b pb-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
        onClick={() => handleStoreClick(store)}
      >
        <h3 className="font-semibold">{store.name}</h3>
        <p>{store.address}</p>
        <p>Contact: {store.contact}</p>
        <p>GST No: {store.gstNo}</p>
        <p>Owner: {store.owner}</p>
      </li>
    ))}
  </ul>
)}
            </div>
          </div>
        </div>
      )}

      {/* Store Setup Modal */}
      {isStoreSetupOpen && user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold mb-4">Set Up Your Medicine Store</h2>
            <form onSubmit={handleStoreSetup}>
              <input
                type="text"
                placeholder="Store Name"
                value={storeData.name}
                onChange={(e) => setStoreData({ ...storeData, name: e.target.value })}
                className="w-full mb-3 p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Address"
                value={storeData.address}
                onChange={(e) => setStoreData({ ...storeData, address: e.target.value })}
                className="w-full mb-3 p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Contact"
                value={storeData.contact}
                onChange={(e) => setStoreData({ ...storeData, contact: e.target.value })}
                className="w-full mb-3 p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="GST Number"
                value={storeData.gstNo}
                onChange={(e) => setStoreData({ ...storeData, gstNo: e.target.value })}
                className="w-full mb-3 p-2 border rounded"
                required
              />
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
              >
                Create Store
              </button>
            </form>
            <button
              onClick={() => setIsStoreSetupOpen(false)}
              className="mt-2 text-gray-600 underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Store Details Modal */}
      {isStoreDetailsOpen && selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedStore.name}</h2>
              <button
                onClick={() => setIsStoreDetailsOpen(false)}
                className="text-gray-600 hover:text-gray-800 text-2xl"
              >
                ×
              </button>
            </div>
            <p className="mb-2"><strong>Address:</strong> {selectedStore.address}</p>
            <p className="mb-2"><strong>Contact:</strong> {selectedStore.contact}</p>
            <p className="mb-4"><strong>GST No:</strong> {selectedStore.gstNo}</p>
            <div className="mb-4">
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Search for medicine..."
                value={manualSearch}
                onChange={handleSearchChange}
                className="w-full p-2 border rounded"
              />
              <button
                type="submit"
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
              >
                Search Medicine
              </button>
            </form>
            {searchResults.length > 0 && (
              <ul className="border rounded max-h-48 overflow-auto mt-1 bg-white">
                {searchResults.map((medicine) => (
                  <li key={medicine._id} className="p-2 hover:bg-gray-100 cursor-pointer">
                    <div className="flex justify-between">
                      <span>{medicine.name}</span>
                      <span className={`font-semibold ${
                        medicine.stockStatus === 'in stock' ? 'text-green-600' :
                        medicine.stockStatus === 'low stock' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {medicine.stockStatus}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">Price: ₹{medicine.price}</div>
                    <div className="text-sm text-gray-600">{medicine.description}</div>
                  </li>
                ))}
              </ul>
            )}
            </div>
            <button
              onClick={() => setIsStoreDetailsOpen(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Back to Stores
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default App
