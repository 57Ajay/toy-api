import { Router } from "express";
import { addToy, getToyByName, modifyToy, deleteToy } from "../controllers/toy.controller"
import verifyToken from "../middlewares/verify.middleware";
const toyRouter = Router();

toyRouter.post('/add-toy', verifyToken, addToy);
toyRouter.get('/:name', getToyByName);
toyRouter.put('/modify/:id', verifyToken, modifyToy);
toyRouter.delete('/delete/:id', verifyToken, deleteToy);


export default toyRouter;