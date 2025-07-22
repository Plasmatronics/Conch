import { Document } from "../models";
import { handlerFactory } from "./controllerFactory";

export const createDocument = handlerFactory.createOne(Document);

export const getDocument = handlerFactory.readOne(Document);

export const updateDocument = handlerFactory.updateOne(Document);

export const deleteDocument = handlerFactory.deleteOne(Document);

export const getAllDocuments = handlerFactory.getAll(Document);
