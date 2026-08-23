import { Pool } from "pg";
import {
	mediaIdColumnName,
	mediaSchema,
	mediaQuerySchema,
	mediaTableName,
	mediaUpdateSchema,
} from "../../schemas";
import { ControllerFactory } from "../controllerFactory";
import { CRUDFactory } from "../../queries";

export const mediaControllers = (dbPool: Pool) => {
	const crudFactory = new CRUDFactory({
		tableName: mediaTableName,
		idColumnName: mediaIdColumnName,
	});

	const mediaControllerFactory = new ControllerFactory({
		dbPool,
		crudFactory,
		createSchema: mediaQuerySchema,
		updateSchema: mediaUpdateSchema,
		tableSchema: mediaSchema,
		conchScoped: true,
		idParamName: "mediaId",
	});

	return mediaControllerFactory.createControllers();
};
