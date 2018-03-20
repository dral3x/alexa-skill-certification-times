const moment = require('moment');
const formatter = require("../formatter");

class TemplateData {
    
    constructor(reference_date) {
        this.start_date = moment(reference_date).subtract(60, 'days').format("YYYY-MM-DD", true);
        this.pivot_date = moment(reference_date).subtract(30, 'days').format("YYYY-MM-DD", true);
        this.end_date = moment(reference_date).format("YYYY-MM-DD", true);
        
        this.recent_items = []
        this.recent_overall_average = 0;
        this.recent_overall_total = 0;

        this.old_overall_average = 0;
        this.old_overall_total = 0;
    }

    addEntry(date, average, count) {
        
        // DEBUG
        console.log("adding date: "+date+" avg: "+average+" count: "+count);
        
        if (this.pivot_date < date) {
            this.recent_items.push({ 
                "date": date, "value": average, "count": count 
            });
            this.recent_overall_average += average*count;
            this.recent_overall_total += count;
        } else {
            this.old_overall_average += average*count;
            this.old_overall_total += count;
        }        
    }

    startDate() {
        return this.start_date;
    }

    endDate() {
        return this.end_date;
    }

    export() {

        this._sortRecentItems();

        let now = moment().format("MMM D, YYYY [at] HH:mm:ss [UTC]", true);
        let average = this.recent_overall_total > 0 ? Math.ceil(this.recent_overall_average/this.recent_overall_total) : 0;
        let average_text = formatter.formatHumanDuration(average);
        let diff = this.recent_overall_total > 0 && this.old_overall_total > 0 ? Math.ceil(this.recent_overall_average/this.recent_overall_total) - Math.ceil(this.old_overall_average/this.old_overall_total) : 0;
        let diff_text = formatter.formatHumanDuration(diff);

        return {
            "last_30_days": this.recent_items,
            "overall": { 
                "average": average, 
                "average_text": average_text, 
                "count": this.recent_overall_total,
                "diff": diff,
                "diff_text": diff_text
            },
            "now": now
        }
    }

    _sortRecentItems() {

        function compare(a, b) {
            if (a.date < b.date)
                return -1;
            if (a.date > b.date)
                return 1;
            return 0;
        }

        this.recent_items.sort(compare);
    }

}

module.exports = TemplateData;
