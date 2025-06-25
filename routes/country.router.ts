import { Router } from "express";
import { getCountries } from "../controllers/country.controller";

const countryRouter = Router();

countryRouter.get('/countries', getCountries);

export default countryRouter;