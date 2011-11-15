(function () {

    /*
     * Primary Options
     **/
    var defaults = {
        base_path : 'https://www.googleapis.com/plus/v1/',
        api_key : null
    };

    /*
     * Merge 2 Objects together
     * @Param obj1: <Object>
     * @Param obj2: <Object>
     **/
    function mergeObjects(obj1, obj2) {
        var obj3 = {};

        for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
        for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
        return obj3;
    }

    /*
     * @Constructor
     * @Param config: <Object>
     * Description: Instantiate the GooglePlusAPI passing on an object with 
     **/
    var GooglePlusAPI = function(api_key)
    {        
        if(!api_key)
        {
            throw "you must set the api_key when instantiating the object";
        }
       
        this.config = mergeObjects(defaults, {
            api_key : api_key
        });
     }

    /*
     * @getPerson[id[, options[, callback]]]
     * !@Param id: <String> - ID of person you wish to fetch
     *  @Param options: <Object> - K/V Pairs to send as GET params
     *  @Param callback: <Function> - Callback to be fired when request is complete
     **/
    GooglePlusAPI.prototype.getPerson = function(id, options, callback)
    {
        return this.request('people/' + id, options, callback);
    }

    /*
     * @listByActivity[activityId[, options[, callback]]]
     * !@Param activityId: <String> - ID of Activity you wish to fetch
     *  @Param options: <Object> - K/V Pairs to send as GET params
     *  @Param callback: <Function> - Callback to be fired when request is complete
     **/
    GooglePlusAPI.prototype.listByActivity = function(activityId, collection, options, callback)
    {
        return this.request('activities/' + activityId + '/people/' + collection, options, callback);
    }

    /*
     * @listActivities[id[, options[, callback]]]
     * !@Param id: <String> - ID of person in which you want to look up the activities
     *  @Param options: <Object> - K/V Pairs to send as GET params
     *  @Param callback: <Function> - Callback to be fired when request is complete
     **/
    GooglePlusAPI.prototype.listActivities = function(id, options, callback)
    {
        return this.request('people/' + id + '/activities/public', options, callback);
    }

    /*
     * @getActivity[id[, options[, callback]]]
     * !@Param id: <String> - ID of activity you wish to fetch
     *  @Param options: <Object> - K/V Pairs to send as GET params
     *  @Param callback: <Function> - Callback to be fired when request is complete
     **/
    GooglePlusAPI.prototype.getActivity = function(id, options, callback)
    {
        return this.request('activities/' + id, options, callback);
    }

    /*
     * @searchActivities[query[, options[, callback]]]
     * !@Param query: <String> - Query for the Activity Search
     *  @Param options: <Object> - K/V Pairs to send as GET params
     *  @Param callback: <Function> - Callback to be fired when request is complete
     **/
    GooglePlusAPI.prototype.searchActivities = function(query, options, callback)
    {
        options.query = query;
        return this.request('activities', options, callback);
    }

    /*
     * @listComments[id[, options[, callback]]]
     * !@Param id: <String> - Activity ID of the object you wish to fetch comments for
     *  @Param options: <Object> - K/V Pairs to send as GET params
     *  @Param callback: <Function> - Callback to be fired when request is complete
     **/
    GooglePlusAPI.prototype.listComments = function(id, options, callback)
    {
        return this.request('activities/' + id + '/comments', options, callback);
    }

    /*
     * @getComment[id[, options[, callback]]]
     * !@Param id: <String> - Comment ID of the comment you wish to lookup
     *  @Param options: <Object> - K/V Pairs to send as GET params
     *  @Param callback: <Function> - Callback to be fired when request is complete
     **/
    GooglePlusAPI.prototype.getComment = function(id, options, callback)
    {
        return this.request('comments/' + id, options, callback);
    }

    /*
     * @searchPeople[query[, options[, callback]]]
     * !@Param id: <String> - Query in which youwish to search for people by
     *  @Param options: <Object> - K/V Pairs to send as GET params
     *  @Param callback: <Function> - Callback to be fired when request is complete
     **/
    GooglePlusAPI.prototype.searchPeople = function(query, options, callback)
    {
        options.query = query
        return this.request('people', options, callback);
    }
    
    /*
     * @request[path[, options[, callback]]]
     * !@Param path: <String> - Location of the resources, example below
     * !@Param options: <Object> - K/V Pairs to send as GET params
     * !@Param callback: <Function> - Callback to be fired when request is complete
     **/
    GooglePlusAPI.prototype.request = function(path, options, callback)
    {
        /*
         * Create a random function to use as the window.callback
         **/
        var magic = '__GooglePlusApiCallback_' + Math.floor( Math.random() * 1000001 );

        var location = this.buildRequestURL(path, options, magic);
        
        
        window[magic] = function(data)
        {
            if(data.error)
            {
                data.error.request = location;
                
                callback(data.error, null);
                return;
            }
            
            callback(null, data);
        }
        
        /*
         * now we assign a script tab to make the request
         **/
        var re = document.createElement('script'); re.type = 'text/javascript'; re.async = true;
        re.src = location;
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(re, s);
    }
    
    /*
     * @buildRequestURL[path[, options[, callbackID]]]
     * !@Param path: <String> - API Segment of the URL we are collecting
     * !@Param options: <Object> - K/V Pairs to send as GET params
     * !@Param callbackID: <Function> - The callback located in window object that the API will call once laoded
     **/
    GooglePlusAPI.prototype.buildRequestURL = function(path, options, callbackID)
    {
        /*
         * Assign API Key
         **/
        options.key = this.config.api_key;
        
        /*
         * Assign Callback ID
         **/
        options.callback = callbackID;
        
        /*
         * Construct the base url
         **/
        var url = this.config.base_path + path;
        
        /*
         * Assign key/Value pairs to GET String
         **/        
        var pairs = [];
        for(var key in options)
        {
            if(!options.hasOwnProperty(key))
            {
                continue;
            }
            
            pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(options[key]));
        }
        
        /*
         * Clean the URL and return it
         **/
        if(pairs.length > 0)
        {
            return url + '?' + pairs.join('&');
        }
        
        return url;
    }
    
    /*
     * Export the object to the root window object.
     **/
    window.GooglePlusAPI = GooglePlusAPI;
})();