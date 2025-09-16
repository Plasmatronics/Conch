import { Document } from "../models";
import { handlerFactory } from "./controllerFactory";

const createDocument = handlerFactory.createOne(Document);

const getDocument = handlerFactory.readOne(Document);

const updateDocument = handlerFactory.updateOne(Document);

const softDeleteDocument = handlerFactory.softDeleteOne(Document);

const cleanupAllDeletedDocuments = handlerFactory.cleanupDeleted(Document);

const restoreDocument = handlerFactory.restoreOneSoftDeleted(Document);

const restoreAllDocuments = handlerFactory.restoreSoftDeleted(Document);

const getManyDocuments = handlerFactory.getMany(Document);

export const documentController = {
	createDocument,
	getDocument,
	updateDocument,
	softDeleteDocument,
	cleanupAllDeletedDocuments,
	restoreDocument,
	restoreAllDocuments,
	getManyDocuments,
};
