import { Router } from "express";
import { deleteUsuario, getUsuario, getUsuarios, postUsuario, putUsuario } from "../controllers/usuarios";
import { check } from "express-validator";
import { validateFields } from "../middlewares/validations";
import Check_in from "../models/check-in";
import { validateJwt } from "../middlewares/validate-jwt";

const router = Router();

router.get('/', getUsuarios);
router.get('/:id', getUsuario);
router.post('/',[
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    check('last_name', 'El apellido es obligatorio').not().isEmpty(),
    check('addres','la dirección es obligatoria').not().isEmpty(),
    check('email', 'El correo es obligatorio').not().isEmpty(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    check('email', 'El correo no es válido').isEmail(),

    // check('id_check_in').custom(async(id_check_in = false) => {
    //     const existId = await Check_in.findOne({id_check_in});
    //     if(!existId){
    //         throw new Error(`el id ${id_check_in} no esta registrado en BD`)
    //     }
    // })

    validateFields
], postUsuario);
router.put('/:id', putUsuario);
router.delete('/:id', [validateJwt], deleteUsuario);


export default router;