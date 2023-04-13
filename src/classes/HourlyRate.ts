import { model, Schema} from "mongoose";

const rateSchema = new Schema({
    paygrade: { type: String, required: true},
    rate: { type: Number, required: true}
});

const Rate = model("Rate", rateSchema);
export default Rate;

