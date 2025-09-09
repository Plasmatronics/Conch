import { http, HttpResponse } from "msw";

const mockFileUrl =
	"https://images.bauerhosting.com/empire/2022/09/jackie-brown-1.jpg?ar=16%3A9&fit=crop&crop=top&auto=format&w=undefined&q=80";

const mockMemberData = {
	_id: "68bded593c9768d183ad7834",
	name: "Joseph Bruno",
	nicknames: ["Joey"],
	birthLocation: {
		type: "Point",
		coordinates: [-73.8648, 40.8448],
		address: "Bronx, New York, USA",
		description: "Born in the Bronx",
	},
	dateOfBirth: "2001-06-15T00:00:00.000Z",
	relationToRootMember: "Brother",
	favThings: {
		movie: "Toy Story",
		food: "Mac and Cheese",
		restaurant: "Chuck E. Cheese",
		color: "Red",
		place: "Local Playground",
		decade: "2000s",
		person: "Big Bird",
		song: "The Wheels on the Bus",
	},
	__v: 0,
	keyPhoto: "68bdedc63c9768d183ad7839",
	id: "68bded593c9768d183ad7834",
};

export const handlers = [
	http.get("http://127.0.0.1:3000/api/v1/familyTreeMembers", () => {
		return HttpResponse.json({
			status: "success",
			data: mockMemberData,
		});
	}),

	http.post("http://127.0.0.1:3000/api/v1/files/download-url", () => {
		return HttpResponse.json({
			status: "success",
			downloadUrl: mockFileUrl,
		});
	}),
];
