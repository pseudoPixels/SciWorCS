$(document).ready(function () {
    $('pre code').each(function (i, block) {
        hljs.highlightBlock(block);
    });


//==========================================================================
//============= NOISE REMOVAL STARTS ==============================================
//==========================================================================

//source code in pre tag... toggle show/hide
$(".code_show_hide").click(function () {
    $("#html_code_fragment_1").toggle(1000);
});

$(".documentation_show_hide").click(function () {
    $(this).siblings('.documentation').toggle(300);
});

$(".settings_show_hide").click(function () {
    $(this).siblings('.settings').toggle(300);
});

$(".setting_param").change(function () {
    alert("you changed my value");
});


});