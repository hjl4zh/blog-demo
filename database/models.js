module.exports = {
	user: {
		name: {type : String, required : true},
		password: {type : String, required : true},
		email: {type : String, required : true}
	},
	post: {
		name: {type: String, required: true},
		title: {type: String, required: true},
		post: {type: String, required: true},
		time: {type: Date, default: Date.now}
	}
}
