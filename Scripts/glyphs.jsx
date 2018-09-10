// Save Glyph: exports selection to a 1024x1024 size document and saves as SVG
// Khalid Alabdullah, April 2018

//////////////Globals/////////////////
var targetDoc;
var sourceDoc = app.activeDocument;
var sourceDocPath = sourceDoc.path;
var appOptions;

var fl = new File(sourceDocPath + "/options.jsx");
try
{
    $.evalFile(fl);
}
catch(e)
{
    /////////// Definition of the Glyphs app options here ////////////
    appOptions = {sizeUPM: 2048, scaleFactor: 1.0};
}

function SaveGlyph () {}

SaveGlyph.prototype.run = function ()
{
    var win = new Window("dialog", "Save Glyph", undefined, {resizeable: false});
    win.alignChildren = "fill";
    
    var pnlScale = win.add("panel", undefined, "Scale");
    var txtScale = pnlScale.add("edittext", undefined, appOptions.scaleFactor.toString());
    txtScale.size = [200,20];
    var pnlName = win.add("panel", undefined, "Name");
    var txtName = pnlName.add("edittext", undefined, "untitled");
    txtName.size = [200,20];
    var grpButtons = win.add("group");
    grpButtons.orientation = "row";
    grpButtons.alignment = "center";
    var btnSave = grpButtons.add("button", undefined, "Save");
    var btnCancel = grpButtons.add("button", undefined, "Cancel");
    txtName.active = true;
    
    saveAndClose = function ()
    {
         var sf = parseFloat(txtScale.text);
         if(isNaN(sf))
         {
             alert("Invalid scale value");
             return;
         }
         else
         {
             appOptions.scaleFactor = sf;
             saveOptions();
         }
         targetDoc = app.documents.add(DocumentColorSpace.CMYK, appOptions.sizeUPM, appOptions.sizeUPM);
         var g = groupItems(sourceDoc);
         var tg = g.duplicate(targetDoc, ElementPlacement.PLACEATEND);
         // Center the tg in the target document
         tg.left = (appOptions.sizeUPM / 2) - (tg.width / 2);
         tg.top = (appOptions.sizeUPM / 2) + (tg.height / 2);
         // Resize the object according to the selected scale factor
         tg.resize(appOptions.scaleFactor * 100, appOptions.scaleFactor * 100);
         // Ungroup
         ungroupItems(tg);
         // Remove the duplicated objects in the source document
         g.remove();
         // Try to save the target document
         var fname = validateFileName(txtName.text);
         if(saveSVG (fname) == true)
         {
             targetDoc.close(SaveOptions.DONOTSAVECHANGES);
             targetDoc = null;
             win.close(1);
         }
    }

    btnSave.onClick = function ()
    {
        saveAndClose();
    }

    btnCancel.onClick = function ()
    {
        win.close(2);
    }

    keyPressed = function(k)
    {
        if(k.keyName === "Enter")
        {
            saveAndClose();
        }
    }

    win.addEventListener ("keydown", function (kd) {keyPressed(kd)});
    
    return(win.show());
}

function validateFileName(fname)
{
    var pth = sourceDoc.path;
    if(fname === "")
    {
        return pth + "/untitled.svg";
    }
    else
    {
        return pth + "/" + fname + ".svg";
    }
}

function saveSVG(fname)
{
    var fl = new File(fname);
    if(fl.exists)
    {
        var ur = confirm(fname + " exists.\nOverwrite?");
        if(ur == true)
        {
            targetDoc.exportFile(fl, ExportType.SVG);
        }
        else
        {
            return false;
        }
    }
    else
    {
        targetDoc.exportFile(fl, ExportType.SVG);
    }
    return true;
}

function saveOptions()
{
    var optstr = "var appOptions = {sizeUPM: " + appOptions.sizeUPM.toString() + ", scaleFactor: " + appOptions.scaleFactor.toString() + "};";
    var fl = new File(sourceDocPath + "/options.jsx");
    try
    {
        fl.open("w");
        fl.write(optstr);
        fl.close();
    }
    catch(e)
    {
        alert(e);
    }
}

function groupItems(doc)
{
    var grp = doc.groupItems.add();
    var sel = doc.selection;
    for(var idx = 0; idx < sel.length; idx++)
    {
        sel[idx].duplicate(grp, ElementPlacement.PLACEATEND);
    }
    return grp;
}

function ungroupItems(grp)
{
    var idx;
    // Unpack the path items
    var items = grp.pathItems;
    for(idx = 0; idx < items.length; idx++)
    {
        items[idx].duplicate(targetDoc, ElementPlacement.PLACEATEND);
    }
     // and the compound path items
    items = grp.compoundPathItems;
    for(idx = 0; idx < items.length; idx++)
    {
        items[idx].duplicate(targetDoc, ElementPlacement.PLACEATEND);
    }
    grp.remove();
}

//////////////// User entry point //////////////////////
if(sourceDoc.selection.length == 0)
{
    alert("No items selected");
}
else
{
    new SaveGlyph().run();
 }


