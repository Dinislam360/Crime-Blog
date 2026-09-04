import express from 'express'
import { deleteUser, getAllUser, getUser, updateUser } from '../controllers/User.controller.js'
import upload from '../config/multer.js'
import { authenticate } from '../middleware/authenticate.js'
import { onlyadmin } from '../middleware/onlyadmin.js'

const UserRoute = express.Router()

UserRoute.use(authenticate)

UserRoute.get('/get-user/:userid', getUser)
UserRoute.put('/update-user/:userid', upload.single('file'), updateUser)
UserRoute.get('/get-all-user', onlyadmin, getAllUser)
UserRoute.delete('/delete/:id', onlyadmin, deleteUser)


export default UserRoute