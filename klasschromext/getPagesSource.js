
// convert dom type to string
function DOMtoString(document_root) {
    var html = '',
        node = document_root.firstChild;
    while (node) {
        switch (node.nodeType) {
        case Node.ELEMENT_NODE:
            html += node.outerHTML;
            break;
        case Node.TEXT_NODE:
            html += node.nodeValue;
            break;
        case Node.CDATA_SECTION_NODE:
            html += '<![CDATA[' + node.nodeValue + ']]>';
            break;
        case Node.COMMENT_NODE:
            html += '<!--' + node.nodeValue + '-->';
            break;
        case Node.DOCUMENT_TYPE_NODE:
            // (X)HTML documents are identified by public identifiers
            html += "<!DOCTYPE " + node.name + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '') + (!node.publicId && node.systemId ? ' SYSTEM' : '') + (node.systemId ? ' "' + node.systemId + '"' : '') + '>\n';
            break;
        }
        node = node.nextSibling;
    }
    return html;
}


//This function finds the classes
function classFinder(document_root) {

    // xpath to the main table, relative to document_root
    var table_xpath = '//*[@id="service_content"]/div[1]/table';
    var table_element = getElementByXpathFromRoot(table_xpath);

    // get rows
    var rows = table_element.getElementsByTagName('tr');
    
    // gets classes in html tag form (table data)
    var classlist = []
    for (var i = 0; i < rows.length; i++){
        var row = rows[i].getElementsByTagName('td')
        if (row){
            classlist.push(row)
        }
    }

    // get class data in list form
    classes = []
    for (var i = 1; i < classlist.length; i++){
        // extract class data from the html tag form of classes in the table
        var classattributes = []
        for (var j = 0; j < classlist[i].length; j++){
            var attribute = classlist[i][j].innerText
            if (attribute == "Dropped"){continue}
            if (attribute!=""){
                classattributes.push(attribute)
            }
        }
        console.log(classattributes)
        
        // combine course number + name (cs 313e, elems of SE -> cs 313e: elems of software design)
        var classspecs =[]
        for (var k = 0; k<classattributes.length;k++){
            attributes = classattributes[k]
            if (k==1){
                attributes += ": " + classattributes[k+1] 
            }
            if (k==2){
                continue
            }
            if (k==3){
                attributes += " " + classattributes[k+1]
            }
            if (k==4){
                continue
            }
            classspecs.push(attributes)
        }
        classes.push(classspecs)     
    }
    return classes
}

function getElementByXpathFromRoot(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

chrome.runtime.sendMessage({
    action: "getSource",
    source: classFinder(document)
});