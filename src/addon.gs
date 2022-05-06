/* addon.gs */

/**
 * name     : addon.gs
 * job      : add-on entry point
 * git      : https://github.com/ccssapp/gsheets-ccssmath
 * author   : CCSS Digital Library https://ccss.app
 * license  : https://opensource.org/licenses/MIT
 */

/**
 * Returns a list standards/clusters related to the query
 *
 * @param {text} search_for - a query for standards by a keyword
 * @param {boolean} as_two_columns - [OPTIONAL] true, returns data key and details in two separate columns.
 * @return standard or cluster text
 *
 * @customfunction
 */
function CCSSMATH(search_for, as_two_columns = false) {

  const ERR_QUERY = 'INVALID-QUERY';

  switch(typeof search_for) {
    case 'string':

      if(search_for.length < 1) {
        return ERR_QUERY;
      }

      if(search_for.match(/\./g,)){
         search_for = search_for.replace(/\s/g, '');
      }

      if(search_for) {
        return getStandardsByKeyword_(search_for, as_two_columns);
      }

     break;
    default:
     return ERR_QUERY;
  }
}


/**
 * Converts valid key/code into CCSS standard/cluster text
 *
 * @param {string} text - "K.OA.A.1" or "K . OA . A . 1" are acceptable inputs
 * @return {string} standard or cluster text
 *
 * @customfunction
 */
function CCSSMATHBYKEY(text) {

  const ERR_NOTKEY = 'INVALID-KEY';

  switch(typeof text) {
    case 'string':
      if(text.match(/\./g,)) {
         text = text.replace(/\s/g, '');
      }

      if(text) {
        return getStandardByKey_(text);
      }
    case 'object':
      if(text instanceof Date) {
        return text;
      }

      if(text instanceof Array) {
        return text.map(CCSSMATHBYKEY);
      }
    default:
      // nothing yet
     return ERR_NOTKEY;
  }
}


/**
 * Converts valid ITEM ID into CCSS standard/cluster texts
 *
 * @param {number} number - an ITEM ID number from 1 to 664 from the ITEMS table
 * @return {string} text - standard or cluster text
 *
 * @customfunction
 */
function CCSSMATHBYID(item_id) {

  const ERR_NOTID = 'INVALID-ITEMID';

  switch(typeof item_id){
    case 'string':
    case 'number':
      if(item_id && !isNaN(item_id) && isFinite(item_id)) {
        if(item_id > 0 && item_id < 665) {
          return data.standards[(item_id-1)].standard.details;
        }
      }

    case 'object':
      if(item_id instanceof Date) {
        return ERR_NOTID;
      }

      if(item_id instanceof Array) {
        return item_id.map(CCSSMATHBYID);
      }

    default:
      break;
  }

  return ERR_NOTID;
}



// helper functions

// returns exactly one standard by key search
function getStandardByKey_(text) {

  text = text.replace(/\s/, '');

  const re = new RegExp(text, 'ig');
  const arr = data.standards.filter(function(obj){

    if(obj.standard.key.match(re)) {
      return true;
    }

    return false;
  });

  if(arr.length < 1 ) {
    return 'KEY-NOT-FOUND';
  }

  return arr[0].standard.details;
}


// returns results from standards query
function getStandardsByKeyword_(text, twoColumns) {

  let arr = data.standards;
  let terms = null;
  let re = null;
  if(text.match(/\s/g)) {
    terms = text.split(/\s/g);
  }

  if(terms && terms.length) {
    for(var j = 0; j < terms.length; j++) {
      re = new RegExp(terms[j], 'ig');
      arr = refine_(arr, re);
    }
  } else {
    re = new RegExp(text, 'ig');
    arr = refine_(arr, re);
  }

  if(arr.length < 1) {
    return 'NO-MATCHES-FOUND';
  }

  const out = [];
  for(var i = 0; i < arr.length; i++) {

    if(twoColumns) {
      out.push([
        arr[i].standard.key,
        arr[i].standard.details
      ]);
    } else {
      out.push([
        arr[i].standard.key,
        arr[i].standard.details
      ].join(' '));
    }
  }

  return out;
}


// returns refined search
function refine_(arr, re) {

    return arr.filter(function(obj){

    if(obj.standard.details.match(re)) {
      return true;
    }

    if(obj.standard.domain.match(re)) {
      return true;
    }

    if(obj.standard.category.match(re)) {
      return true;
    }

    if(obj.standard.key.match(re)) {
      return true;
    }

    return false;
  });
}
