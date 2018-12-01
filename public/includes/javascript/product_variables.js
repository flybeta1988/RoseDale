var sort = false;
var order = 'asc';
var curpage = 1;
var curloc = '';
var global_hash = '';
var global_loaded = true;
var global_reset;
var global_catid;
var global_manid;
var global_page;
var global_sortorder;
var global_varlist;
var global_newvar;
var global_resetpage;
var global_parent;

window.addEventListener("popstate", function(e) {
	var hashmatch = window.location.hash.match(/^#(\d+)-(.*)?$/);
	if(global_varlist != hashmatch[2] || global_page != hashmatch[1]) {
		updateFilters(global_reset, global_catid, global_manid, global_parent, hashmatch[1], global_sortorder, hashmatch[2], '', global_resetpage)
	}
});
function updateFilters(reset, catid, manid, parent, page, sortorder, varlist, newvar, resetpage){
	$('#producttable').html('<div class="outer-center"><div class="inner-center"><img src="images/site/spinner.gif" /></div></div><br clear="both" />');
	if(typeof resetpage == 'undefined') {
		resetpage = 0;
	}
	var hashmatch = window.location.hash.match(/^#(\d+)-(.*)?$/);
	if(resetpage == 0 && hashmatch != null) {
		page = hashmatch[1];
		varlist = hashmatch[2];
	}
	if(typeof newvar != 'undefined' && newvar != '' && newvar.match(/^\d+$/) && $('#variable-'+newvar+' :selected').val() > 0) {
		newvar = newvar + '|' + $('#variable-'+newvar+' :selected').val();
	}
  if(typeof newvar == 'undefined') {
    newvar = '';
  }
  if(sortorder == undefined) { sortorder = 0; }
  var idlist = '';
  if(sort === sortorder && order == 'asc' && curpage == page) {
    order = 'desc';
  } else if(sort === sortorder && order == 'desc' && curpage == page) {
    order = 'asc';
  }
  if(reset == 1) {
    sortorder = 0;
    order = 'asc';
  }
  sort = sortorder;
  curpage = page;
	$.post('includes/ajax/ajax.variables.php', {
      variablelist: varlist,
      catid: catid,
      manid: manid,
      page: page,
      sort: sortorder,
      order: order,
      newvar: newvar,
			parent: parent,
			curloc: curloc
    },
    function(data){
   		if($('#selectlist').length > 0) {
   			$('#selectlist').html(data.selects);
   		}
   		if($('#facetedsearch').length > 0) {
   			if(data.facetedsearch != null) {
   				$('#facetedsearch').parent().parent().show();
   				$('#facetedsearch').html(data.facetedsearch);
   				$('#facetedsearch a').hover(
	   				function(){
	   					$(this).addClass('ui-state-hover');
	   				},
	   				function(){
	   					$(this).removeClass('ui-state-hover');
	   				}
   				);
					setupScrollBars();
   			} else {
   				$('#facetedsearch').parent().parent().remove();
   			}
   		}
   		if($('#columnLeft').height() < $('#bodyContent').height()) {
   			$('#columnLeft').height($('#bodyContent').height());
   		}
    	$('html, body').animate({
    		scrollTop: 0
    	}, 100);
    	curloc = page+'-'+data.varlist;
    	global_loaded = true;
    	global_hash = curloc;
    	global_reset = reset;
    	global_catid = catid;
    	global_manid = manid;
    	global_page = page;
    	global_sortorder = sortorder;
    	global_varlist = data.varlist;
    	global_newvar = newvar;
    	global_resetpage = resetpage;
    	global_parent = parent;
    	if(data.facetedsearch != null && data.selects != '' && !data.producttable.match(/no-products-msg/) && data.producttable != '') {
    		window.location.hash = curloc;
    	}
    	$('#producttable').html(data.producttable);
    	return false;
    },'json'
  ).error(function(err){
    $('#debug').html(err.responseText);
  });
}
function initFacetedSearch(catid, manid) {
//  alert(catid);
}
function editVariable(id) {
	if($('#editvariabledialog').length == 0) {
		$('body').append('<div id="editvariabledialog" />');
	}
	var text = 'text';
	$('#editvariabledialog').dialog({
		modal: true,
		open: function(){
			$('#variablename').val($('select[name=variable_variable\\['+id+'\\]] :selected').text());
		},
		buttons: {
			update: function(){
				if($('#variablename').val() !== '') {
					$.post('../includes/ajax/ajax.variables.php', {
						variableid: id,
						variabletext: $('#variablename').val()
					},
					function(data) {
						$('select[name=variable_variable\\['+id+'\\]] :selected').text($('#variablename').val());
					}
					).error(function(err){
						alert(err.responseText);
					});
					$(this).dialog('close');
				} else {
					alert('Variable Name Cannot Be Blank', 'Entry Error');
				}
			},
			close: function() {
				$(this).dialog('close');
			}
		}
	});
}
function submitForm(formid) {
	var qty = false;
	$('.quantity').each(function(){
		if($(this).val() > 0) {
			qty = true;
		}
	});
	if(qty) {
		var form = document.getElementById(formid);
		form.submit();
	} else {
		alert('No Products Selected');
	}
}
function setupScrollBars() {
	$('div.menuContainerJSListBox').niceScroll({
		cursorcolor: $('.productListingHeader').css('background-color'),
		background: '#C0C0C0',
		railpadding: {left: 1},
		autohidemode: false,
		cursorwidth: 10,
		touchbehavior: false
	});
}
function hideColumns(clearlabel) {
	$('div.filtercolumn').each(function(){
		var elem = $(this).find('a');
		if(elem.html() != clearlabel) {
			$(this).hide();
			$(this).prev().find('span').removeClass('ui-icon-triangle-1-e').addClass('ui-icon-triangle-1-s');
		} else {
			$(this).prev().addClass('selected');
			$(this).prev().find('span').removeClass('ui-icon-triangle-1-s').addClass('ui-icon-triangle-1-e');
		}
	});
}
function setFilterHeight(depth) {
	if(typeof $('div.filtercolumn').css('height') == 'undefined' || parseFloat($('div.filtercolumn').css('height'), 10) == 0) {
		$('div.filtercolumn').css('height', ($('a.search_item').parent().outerHeight(true) * depth) + 7);
	}
	$('div.filtercolumn li:last-child').each(function(index){
		var bottom = $(this).position().top + $(this).outerHeight(true);
		var height = $(this).parent().parent().height();
		if(bottom < height) {
			$(this).parent().parent().height(bottom + 7);
		}
	});
}
