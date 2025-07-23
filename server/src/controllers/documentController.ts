import { Document } from "../models";
import { handlerFactory } from "./controllerFactory";

const createDocument = handlerFactory.createOne(Document);

const getDocument = handlerFactory.readOne(Document);

const updateDocument = handlerFactory.updateOne(Document);

const deleteDocument = handlerFactory.deleteOne(Document);

const getAllDocuments = handlerFactory.getAll(Document);

export const documentController = {
	createDocument,
	getDocument,
	updateDocument,
	deleteDocument,
	getAllDocuments,
};
