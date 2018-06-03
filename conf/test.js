module.exports = {
	
    "twitter": {
        consumer_key:         'ck',
        consumer_secret:      'cs',
        access_token:         'at',
        access_token_secret:  'ats'
    },

    "aws": {
        region: 'anywhere'
    },

    "dynamodb": {
        table_datapoints:   't_datapoints',
        table_daily:        't_daily',
        table_state:        't_state',
        table_skill:        't_skill'
    },

    "s3": {
        bucket_website:     's_bucket'
    },

    "sns": {
        topic_request_process:          'sns_process',
        topic_request_generate_website: 'sns_generate_website'
    },

    "skill": {
        app_id: ''
    },

}