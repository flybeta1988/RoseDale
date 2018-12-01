function savePDF() {
	$('#flyout_contact').css('display','none');
	var dochtml = $("html").html();
	$('#flyout_contact').css('display','block');
	var form     = $('<form/>', {"action":"savePDF.php", "method":"POST", "accept-charset":"UTF-8"});
	var content  = $('<input/>', {"type":"text", "name":"content"}).appendTo(form);
	content.val(dochtml.replace(/\s+/g, ' '));
	form.hide().appendTo("body").submit();
	form.remove();
};
