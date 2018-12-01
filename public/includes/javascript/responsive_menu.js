/**
 * Created by tgillis on 2/8/2016.
 */
$(function() {
    $("#responsive_nav").mmenu({
        offCanvas: {
            position  : "right",
            zposition : "front"
        },
        extensions: ["pagedim-black", "multiline"]
    });
});