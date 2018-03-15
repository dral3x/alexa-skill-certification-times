const moment = require('moment');

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

        let now = moment().format("MMM D, YYYY \at HH:mm:ss UTC", true);

        return {
            "last_30_days": this.recent_items,
            "overall": { 
                "average": this.recent_overall_average/this.recent_overall_total, 
                "count": this.recent_overall_total,
                "diff": this.recent_overall_average/this.recent_overall_total-this.old_overall_average/this.old_overall_total
            },
            "now": now
        }
    }

}

module.exports = TemplateData;
