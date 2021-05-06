const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const [found] = users.filter((user)=>  user.username === request.headers?.username)
  
  if(!found){
    return response.status(400).json({
      error: 'Invalid user'
    })
  }
 
  request.user = found
  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body
  const [found] = users.filter((user)=>  user.username === username && user.name === name)
  
  if(found){
    return response.status(400).json({
      error: 'User already registered'
    })
  }

  const user = {
    id: uuidv4(),
    name, 
    username,  
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  return response.status(200).json(request.user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body

  const todo = {
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }
  
  const userIndex = users.findIndex(user => user.id = request.user.id)
  users[userIndex].todos.push(todo)
  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const userIndex = users.findIndex(user => user.id === request.user.id)
  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id === request.params.id)
  const oldTodo =  users[userIndex].todos[todoIndex]

  if(!oldTodo) {
    return response.status(404).json({
      error: 'Todo not found'
    })
  }
 
  const newTodo = {
    ...oldTodo,
    ...request.body
  }
  
  users[userIndex].todos[todoIndex] = newTodo
  return response.status(200).json(newTodo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const userIndex = users.findIndex(user => user.id === request.user.id)
  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id === request.params.id)
  const oldTodo =  users[userIndex].todos[todoIndex]

  if(!oldTodo) {
    return response.status(404).json({
      error: 'Todo not found'
    })
  }
 
  const newTodo = {
    ...oldTodo,
    done: true
  }
  
  users[userIndex].todos[todoIndex] = newTodo
  return response.status(200).json(newTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const userIndex = users.findIndex(user => user.id === request.user.id)
  const todoIndex = users[userIndex].todos?.findIndex(todo => todo.id === request.params.id)

  if(todoIndex === -1) {
    return response.status(404).json({
      error: 'Todo not found'
    })
  }
 
  const newTodos = users[userIndex].todos.filter(todo => todo.id !== request.params.id)
  users[userIndex].todos = newTodos
  return response.status(204).json()
});

module.exports = app;