import {Point} from "./Point";
import {TileMap} from "./TileMap";

export interface Tool {
    name? : string, //	Name of the tool as shown on the tool bar.
    map : TileMap,//	Currently active tile map.
    selectedTile? : Tile //	The last clicked tile for the active map. See also the currentBrush property of MapEditor.
    // preview : TileMap,//	Get or set the preview for tile layer edits.
    tilePosition? : Point //	Mouse cursor position in tile coordinates.
    statusInfo? : string //	Text shown in the status bar while the tool is active.
    enabled? : boolean //	Whether this tool is enabled.
    // activated : ()=>void,// : void	Called when the tool was activated.
    // deactivated : ()=>void,// : void	Called when the tool was deactivated.
    // keyPressed : function(key, modifiers) : void	Called when a key was pressed while the tool was active.
    // mouseEntered : function() : void	Called when the mouse entered the map view.
    // mouseLeft : function() : void	Called when the mouse left the map view.
    // mouseMoved : function(x, y, modifiers) : void	Called when the mouse position in the map scene changed.
    // mousePressed : ()=>void, //function(button, x, y, modifiers) : void	Called when a mouse button was pressed.
    // mouseReleased : ()=>void, //function(button, x, y, modifers) : void	Called when a mouse button was released.
    // mouseDoubleClicked : function(button, x, y, modifiers) : void	Called when a mouse button was double-clicked.
    // modifiersChanged : function(modifiers) : void	Called when the active modifier keys changed.
    // languageChanged : function() : void	Called when the language was changed.
    // mapChanged : function(oldMap : TileMap, newMap : TileMap) : void	Called when the active map was changed.
    // tilePositionChanged : ()=>void, //function() : void	Called when the hovered tile position changed.
    // updateStatusInfo : function() : void	Called when the hovered tile position changed. Used to override the default updating of the status bar text.
    // updateEnabledState : function() : void	Called when the map or the current layer changed.
}