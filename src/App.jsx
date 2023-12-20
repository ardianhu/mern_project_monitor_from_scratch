import { useEffect } from 'react'
import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import axios from 'axios'
// import './App.css'

function App() {

  const [show, setShow] = useState(false)
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const [idToEdit, setIdToEdit] = useState('')

  const [editShow, setEditShow] = useState(false)
  const handleEditClose = () => {
    setEditShow(false)
    setIdToEdit('')
  }
  const handleEditShow = (_id) => {
    setEditShow(true)
    setIdToEdit(_id)
  }

  return (
    <>
      <div className='container-fluid'>
        <div className='mb-4 mt-4'>
          <Button variant='dark' onClick={handleShow}>Add Projects</Button>
        </div>
        <table className='table'>
          <thead className='table-dark'>
            <tr>
              <th>Project Name</th>
              <th>Project Manager</th>
              <th>Client</th>
              <th>Start By</th>
              <th>Due By</th>
              <th>Process</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <Projects handleEditShow={handleEditShow} />
          </tbody>
        </table>
      </div>
      <CreateModal show={show} handleClose={handleClose} />
      <EditModal editShow={editShow} handleEditClose={handleEditClose} idToEdit={idToEdit} />
    </>
  )
}

function Projects({ handleEditShow }) {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    axios
    .get("http://localhost:8082/api/projects")
    .then((res) => {
      setProjects(res.data)
    })
    .catch((err) => {
      console.log(err)
    })
  })

  const onDeleteClick = (id) => {
    axios
    .delete(`http://localhost:8082/api/projects/${id}`)
    .then((res) => {
      console.log(`project dengan ${id} berhasil di hapus`)
    })
    .catch((err) => {
      console.log('error di ondeleteclick' + err)
    })
  }
  
  const projectList = projects.length === 0 ? "no projects yet" : projects.map((project, k) => 
    <tr key={k}>
    <th >{project.name}</th>
    <th >{project.project_manager}</th>
    <th >{project.client}</th>
    <th >{project.start_by}</th>
    <th >{project.due_by}</th>
    <th >
      <div className='progress'>
        <div className='progress-bar' role='progressbar' style={{ width: `${project.process}%`}} aria-valuenow={project.process} aria-valuemin="0" aria-valuemax="100"></div>
      </div>{project.process}%
    </th>
    <th>
      <button type='button' className='btn btn-primary me-2' onClick={() => {handleEditShow(project._id)}}>Edit</button>
      <button type='button' className='btn btn-danger' onClick={() => {onDeleteClick(project._id)}}>Delete</button>
    </th>
    </tr>
  )

  return (
    <>
      {projectList}
    </>
  )
}

function CreateModal({ show, handleClose }) {
  
  const [project, setProject] = useState({
    name: "",
    project_manager: "",
    client: "",
    start_by: "",
    due_by: "",
    process: "",
  })

  const onChange = (e) => {
    setProject({...project, [e.target.name]: e.target.value})
  }

  const onSubmit = (e) => {
    e.preventDefault()
    axios
    .post("http://localhost:8082/api/projects", project)
    .then((res) => {
      setProject({
        name: "",
        project_manager: "",
        client: "",
        start_by: "",
        due_by: "",
        process: "",
      })
      handleClose()
      })
    .catch((err) => {
      console.log(err)
    })
    }

  return (
    <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Projects</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CreateProject handleClose={handleClose} project={project} onChange={onChange} onSubmit={onSubmit} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleClose}>Close</Button>
          <Button variant='primary' onClick={onSubmit}>Save</Button>
        </Modal.Footer>
      </Modal>
  )
}

function EditModal({ editShow, handleEditClose, idToEdit }) {
  const [project, setProject] = useState({
    name: "",
    project_manager: "",
    client: "",
    start_by: "",
    due_by: "",
    process: "",
  })

  useEffect(() => {
    if(idToEdit) {
      axios
      .get(`http://localhost:8082/api/projects/${idToEdit}`)
      .then((res) => {
        const dueDate = new Date(res.data.due_by)
        const dueDateF = dueDate.toISOString().split('T')[0]
        const startDate = new Date(res.data.start_by)
        const startDateF = startDate.toISOString().split('T')[0]
        setProject({
          name: res.data.name,
          project_manager: res.data.project_manager,
          client: res.data.client,
          start_by: startDateF,
          due_by: dueDateF,
          process: res.data.process,
        })
      })
      .catch((err) => {
        console.log(err)
      })
    }
  }, [idToEdit])

  const onChange = (e) => {
    setProject({...project, [e.target.name]: e.target.value})
  }

  const onSubmit = (e) => {
    e.preventDefault()

    const data = {
      name: project.name,
      project_manager: project.project_manager,
      client: project.client,
      start_by: project.start_by,
      due_by: project.due_by,
      process: project.process,
    }

    axios
    .put(`http://localhost:8082/api/projects/${idToEdit}`, data)
    .then((res) => {
      handleEditClose()
    })
    .catch((err) => {
      console.log(err)
    })
  }


  return (
    <Modal show={editShow} onHide={handleEditClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Projects</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <EditProject project={project} onChange={onChange} onSubmit={onSubmit} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={handleEditClose}>Close</Button>
        <Button variant='primary'>Save</Button>
      </Modal.Footer>
    </Modal>
  )
}

function CreateProject({ project, onChange, onSubmit }) {

  return (
    <form noValidate onSubmit={onSubmit}>
      <div className="mb-3">
        <label htmlFor="name" className="form-label">Project Name</label>
        <input type="text" className="form-control" id="name" name='name' value={project.name} onChange={onChange} />
      </div>
      <div className="mb-3">
        <label htmlFor="pm" className="form-label">Project Manager</label>
        <input type="text" className="form-control" id="pm" name='project_manager' value={project.project_manager} onChange={onChange} />
      </div>
      <div className="mb-3">
        <label htmlFor="client" className="form-label">Client</label>
        <input type="text" className="form-control" id="client" name='client' value={project.client} onChange={onChange} />
      </div>
      <div className="mb-3">
        <label htmlFor="start" className="form-label">Start By</label>
        <input type="date" className="form-control" id="start" name='start_by' value={project.start_by} onChange={onChange} />
      </div>
      <div className="mb-3">
        <label htmlFor="due" className="form-label">Due By</label>
        <input type="date" className="form-control" id="due" name='due_by' value={project.due_by} onChange={onChange} />
      </div>
      <div className="mb-3">
        <label htmlFor="process" className="form-label">Process</label>
        <input type="number" className="form-control" id="process" name='process' value={project.process} onChange={onChange} />
      </div>
      <button type="submit" className="btn btn-primary invisible">Submit</button>
    </form>
  )
}

function EditProject({ project, onChange, onSubmit }) {
    return (
      <form noValidate onSubmit={onSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Project Name</label>
          <input type="text" className="form-control" id="name" name='name' value={project.name} onChange={onChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="pm" className="form-label">Project Manager</label>
          <input type="text" className="form-control" id="pm" name='project_manager' value={project.project_manager} onChange={onChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="client" className="form-label">Client</label>
          <input type="text" className="form-control" id="client" name='client' value={project.client} onChange={onChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="start" className="form-label">Start By</label>
          <input type="date" className="form-control" id="start" name='start_by' value={project.start_by} onChange={onChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="due" className="form-label">Due By</label>
          <input type="date" className="form-control" id="due" name='due_by' value={project.due_by} onChange={onChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="process" className="form-label">Process</label>
          <input type="number" className="form-control" id="process" name='process' value={project.process} onChange={onChange} />
        </div>
        <button type="submit" className="btn btn-primary invisible">Submit</button>
      </form>
    )
}

export default App
