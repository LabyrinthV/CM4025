import { ObjectId } from "mongodb";
import { model, Schema} from "mongoose";

const quoteSchema = new Schema({
    quote: { type: Number, required: true},
    name: { type: String, required: true},
    subtasks: [{
        subquote: { type: Number, required: true},
        paygrade: { type: String, required: true},
        time: { type: Number, required: true},
        period: { type: String, required: true},
        amount: { type: Number, required: true},
        ongoingCosts: { 
            amount: { type: Number, required: true},
            frequency: { type: String, required: true},
        },
        oneOffCosts: { type: Number, required: true}
    }],
});

const Quote = model("Quote", quoteSchema);
export default Quote;
