typing:
types include interface for backend model and doc
Hydrated{model name} includes the model, hydrated with all mongoose metadata like \_\_v, id, and \_id.
Populated{model name} includes all populated data that occurs on every get request to said model on the backend. For example numLikes is always populated on Story, so on PopulatedStoryDTO, numLikes is a normalized structure instead of just a string representing its id.
