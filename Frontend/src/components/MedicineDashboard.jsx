import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function MedicineDashboard() {
  const [store, setStore] = useState(null)
  const [medicines, setMedicines] = useState([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState(null)
  const [user, setUser] = useState(null)
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    stock: '',
    price: '',
    description: ''
  })
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false)
  const [newStore, setNewStore] = useState({
    name: '',
    address: '',
    contact: '',
    gstNo: ''
  })
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      console.log('Logged in user:', userData)
      if (userData.role === 'medicine_store') {
        setUser(userData)
        fetchStore(userData.email)
      } else {
        navigate('/')
      }
    } else {
      navigate('/')
    }
  }, [navigate])

  const fetchStore = async (email) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:8000/api/stores', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const stores = await res.json()
      if (stores.length > 0) {
        setStore(stores[0])
        fetchMedicines(stores[0]._id)
      } else {
        setIsAddStoreOpen(true)
      }
    } catch (err) {
      console.error('Failed to fetch store:', err)
    }
  }

  const fetchMedicines = async (storeId, query = '') => {
    try {
      const token = localStorage.getItem('token')
      let url = `http://localhost:8000/api/medicines/store/${storeId}`
      if (query && query.trim() !== '') {
        url = `http://localhost:8000/api/medicines/search/${storeId}?query=${encodeURIComponent(query)}`
      }
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setMedicines(data)
    } catch (err) {
      console.error('Failed to fetch medicines:', err)
    }
  }

  const handleAddMedicine = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      console.log('Adding medicine to store:', store._id, 'with data:', newMedicine)
      const res = await fetch(`http://localhost:8000/api/medicines/store/${store._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newMedicine)
      })
      if (res.ok) {
        setIsAddModalOpen(false)
        setNewMedicine({ name: '', stock: '', price: '', description: '' })
        fetchMedicines(store._id, searchQuery)
      } else {
        const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Failed to add medicine:', res.status, errorData);
        alert(`Failed to add medicine: ${errorData.message || 'Unknown error'}`)
      }
    } catch (err) {
      console.error('Add medicine failed:', err)
    }
  }

  const handleEditMedicine = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:8000/api/medicines/${editingMedicine._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingMedicine)
      })
      if (res.ok) {
        setIsEditModalOpen(false)
        setEditingMedicine(null)
        fetchMedicines(store._id, searchQuery)
      } else {
        alert('Failed to update medicine')
      }
    } catch (err) {
      console.error('Update medicine failed:', err)
    }
  }

  const handleDeleteMedicine = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`http://localhost:8000/api/medicines/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          fetchMedicines(store._id, searchQuery)
        } else {
          alert('Failed to delete medicine')
        }
      } catch (err) {
        console.error('Delete medicine failed:', err)
      }
    }
  }

  const openEditModal = (medicine) => {
    setEditingMedicine({ ...medicine })
    setIsEditModalOpen(true)
  }

  const handleAddStore = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:8000/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newStore)
      })
      if (res.ok) {
        setIsAddStoreOpen(false)
        setNewStore({ name: '', address: '', contact: '', gstNo: '' })
        fetchStore(user.email)
      } else {
        const errorData = await res.json().catch(() => ({ message: 'Unknown error' }))
        alert(`Failed to add store: ${errorData.message || 'Unknown error'}`)
      }
    } catch (err) {
      console.error('Add store failed:', err)
    }
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (isAddStoreOpen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Add New Medicine Store</h2>
          <form onSubmit={handleAddStore}>
            <input
              type="text"
              placeholder="Store Name"
              value={newStore.name}
              onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
              className="w-full mb-3 p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Address"
              value={newStore.address}
              onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
              className="w-full mb-3 p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Contact"
              value={newStore.contact}
              onChange={(e) => setNewStore({ ...newStore, contact: e.target.value })}
              className="w-full mb-3 p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="GST Number"
              value={newStore.gstNo}
              onChange={(e) => setNewStore({ ...newStore, gstNo: e.target.value })}
              className="w-full mb-3 p-2 border rounded"
              required
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex-1"
              >
                Add Store
              </button>
              <button
                type="button"
                onClick={() => setIsAddStoreOpen(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (!store) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{store.name}</h1>
              <p className="text-gray-600">{store.address}</p>
              <p className="text-gray-600">Contact: {store.contact} | GST: {store.gstNo}</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Back to Home
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search medicines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-2 rounded w-full max-w-sm"
          />
          <button
            onClick={() => fetchMedicines(store._id, searchQuery)}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Search
          </button>
        </div>

        {/* Medicines Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Medicines Inventory</h2>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Add Medicine
            </button>
          </div>

          {/* Medicines Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Stock</th>
                  <th className="px-4 py-2 text-left">Price</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((medicine) => (
                  <tr key={medicine._id} className="border-b">
                    <td className="px-4 py-2">{medicine.name}</td>
                    <td className="px-4 py-2">{medicine.stock}</td>
                    <td className="px-4 py-2">₹{medicine.price}</td>
                    <td className="px-4 py-2">{medicine.description}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        onClick={() => openEditModal(medicine)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMedicine(medicine._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {medicines.length === 0 && (
              <p className="text-center py-8 text-gray-500">No medicines added yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Medicine Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold mb-4">Add New Medicine</h2>
            <form onSubmit={handleAddMedicine}>
              <input
                type="text"
                placeholder="Medicine Name"
                value={newMedicine.name}
                onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                className="w-full mb-3 p-2 border rounded"
                required
              />
              <input
                type="number"
                placeholder="Stock"
                value={newMedicine.stock}
                onChange={(e) => setNewMedicine({ ...newMedicine, stock: e.target.value })}
                className="w-full mb-3 p-2 border rounded"
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={newMedicine.price}
                onChange={(e) => setNewMedicine({ ...newMedicine, price: e.target.value })}
                className="w-full mb-3 p-2 border rounded"
                required
              />
              <textarea
                placeholder="Description"
                value={newMedicine.description}
                onChange={(e) => setNewMedicine({ ...newMedicine, description: e.target.value })}
                className="w-full mb-3 p-2 border rounded"
                rows="3"
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex-1"
                >
                  Add Medicine
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Medicine Modal */}
      {isEditModalOpen && editingMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold mb-4">Edit Medicine</h2>
            <form onSubmit={handleEditMedicine}>
              <input
                type="text"
                placeholder="Medicine Name"
                value={editingMedicine.name}
                onChange={(e) => setEditingMedicine({ ...editingMedicine, name: e.target.value })}
                className="w-full mb-3 p-2 border rounded"
                required
              />
              <input
                type="number"
                placeholder="Stock"
                value={editingMedicine.stock}
                onChange={(e) => setEditingMedicine({ ...editingMedicine, stock: e.target.value })}
                className="w-full mb-3 p-2 border rounded"
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={editingMedicine.price}
                onChange={(e) => setEditingMedicine({ ...editingMedicine, price: e.target.value })}
                className="w-full mb-3 p-2 border rounded"
                required
              />
              <textarea
                placeholder="Description"
                value={editingMedicine.description}
                onChange={(e) => setEditingMedicine({ ...editingMedicine, description: e.target.value })}
                className="w-full mb-3 p-2 border rounded"
                rows="3"
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 flex-1"
                >
                  Update Medicine
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MedicineDashboard
