import express from "express";

const router = express.Router();

router.route("/").get((req, res, next) => {
	next();
});

export { router as familyTreeMemberRouter };
