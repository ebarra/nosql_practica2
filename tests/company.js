const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

const CompanySchema = Schema({
    name: String,
    permalink : String,
  	crunchbase_url : String,
  	homepage_url : String,
  	blog_url : String,
  	blog_feed_url : String,
  	twitter_username : String,
  	category_code : String,
  	number_of_employees : Number,
  	founded_year : Number,
  	founded_month : Number,
  	founded_day : Number,
  	deadpooled_year : Number,
  	deadpooled_month : Number,
  	deadpooled_day : Number,
  	deadpooled_url : String,
  	tag_list : String,
  	alias_list : String,
  	email_address : String,
  	phone_number : Schema.Types.Mixed,
  	description : String,
  	created_at : Date,
  	updated_at : Date,
  	overview : String,
  	image : Object,
  	products : [
  		{
  			name : String,
  			permalink : String,
  		}
  	],
  	relationships : Array,
  	competitions : [
  		{
  			competitor : {
  				name : String,
  				permalink : String,
  			}
  		}
  	],
  	providerships : [ ],
  	total_money_raised : String,
  	funding_rounds : [ ],
  	investments : [ ],
  	acquisition : String,
  	acquisitions : [ ],
  	offices : [
  		{
  			description : String,
  			address1 : String,
  			address2 : String,
  			zip_code : String,
  			city : String,
  			state_code : String,
  			country_code : String,
  			latitude : Number,
  			longitude : Number,
  		}
  	],
  	milestones : Array,
  	ipo : String,
  	video_embeds : Array,
  	screenshots : Array,
  	external_links : Array,
  	partners : Array,
    owners: Array
  });

module.exports = mongoose.model('Company', CompanySchema);
