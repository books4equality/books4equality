<script>
$(function() {
  $('#btn-register').click(function(event) {
  	event.preventDefault();
  	var json = {};
  	error = [];

  	$('#incomplete-form').empty();
  	$('#incomplete-form').addClass('hide');
    $('#book-reg-failure').text('')
    $('#book-reg-failure').addClass('hide')

    //collect field values
    $('.form-control').each(function(){
      if($(this).val() == undefined || $(this).val() == ''){
        if($(this).attr('id') == 'donor_email') { //Donor email is not required
          json[$(this).attr('id')] = $(this).val()
        } else {
          error.push($(this).attr('id') + ' is a required field');
        }
      } else {
        if($(this).attr('id') == 'authors') {
          json.authors = []
          var authors = $(this).val().split(",")
          authors.forEach(function(author){
            json.authors.push(author.trim())
          })
        } else {
          json[$(this).attr('id')] = $(this).val();
        }
      }
    });
    json.schoolID = "<%- schoolID %>"
    if(error.length !== 0){
      error.forEach(function (item) {
        $('#incomplete-form').append('<div>' + item + '</div>')
      });
      $('#incomplete-form').removeClass('hide');
      console.log(error);
    } else {
      $.ajax({
        url: '/api/admin/booksManualEntry',
        type: 'POST',
        dataType: 'json',
        data: json,
        statusCode: {
          404: function() {
            console.log("bad route")
            $('#book-reg-failure').removeClass('hide');
            $('#book-reg-failure').text('Bad Route')
          },
          500: function() {
            console.log("Database error")
            $('#book-reg-failure').removeClass('hide');
            $('#book-reg-failure').text('Database Error')
          },
          401: function() {
            console.log("Unauthorized")
            $('#book-reg-failure').removeClass('hide');
            $('#book-reg-failure').text('You are not autorized')
          },
          269: function() {
            console.log("ISBN not resolved from external sources")
            $('#book-reg-failure').removeClass('hide');
            $('#book-reg-failure').text('ISBN not resolved from external sources')
          },
          409: function() {
            console.log("Duplicate barcode entered")
            $('#book-reg-failure').removeClass('hide');
            $('#book-reg-failure').text('Duplicate barcode entered')
          },
          400: function() {
            alert("Barcode is all shitty.")
          },
          204: function() {
            console.log("Success")
            $('#book-reg-success').removeClass('hide');
            $('.form-control').val('')
          }
        }
      });
    }
  });

  $('#btn-clear').click((e) => {
    e.preventDefault()
    $('.form-control').val('')
    $('.alert').addClass('hide')
    $('#book-reg-failure').text('')
  })
})
</script>
