$(document).ready(function () {

    function manageEmojiOnUserResponse(userResponse) {
        var neural_net_response = $("#auto_validation_neuralNet").val();
        var svm_net_response = $("#auto_validation_svm").val();


        //Neural Net
        if (neural_net_response == userResponse) {
            $("#img_response_neuralnet").attr('src', 'static/img/happy.png?' + new Date().getTime());
            $("#txt_response_neuralnet").html('I predicted last one correctly.');
        }
        else {
            $("#img_response_neuralnet").attr('src', 'static/img/sad.png?' + new Date().getTime());
            $("#txt_response_neuralnet").html('I failed to predict last one.');
        }



        //SVM
        if (svm_net_response == userResponse) {
            $("#img_response_svm").attr('src', 'static/img/happy.png?' + new Date().getTime());
            $("#txt_response_svm").html('I predicted last one correctly.');
        }
        else {
            $("#img_response_svm").attr('src', 'static/img/sad.png?' + new Date().getTime());
            $("#txt_response_svm").html('I failed to predict last one.');
        }




    }

    //No more clones available for valdiation.
    if ($("#doc_id").val() == 'NA') {
        $('#btn_tp_clone').hide();
        $('#btn_fp_clone').hide();
    }





    $("#btn_tp_clone").click(function () {
        var doc_id = $("#doc_id").val();

        if (doc_id == 'NA') {
            $('#btn_tp_clone').hide();
            $('#btn_fp_clone').hide();
        }
        else {
            manageEmojiOnUserResponse("TP");

            $.ajax({
                type: "POST",
                cache: false,
                url: "/get_next_code_fragments_for_validation",
                data: { doc_id: doc_id, user_response: "TP" },
                success: function (option) {
                    //alert(option.var1);

                    $("#html_code_fragment_1").html(option.codeFragment_1);
                    $("#html_code_fragment_2").html(option.codeFragment_2);

                    $("#doc_id").val(option.doc_id);
                    $("#auto_validation_neuralNet").val(option.neural_net_response);
                    $("#auto_validation_svm").val(option.neural_net_response);



                    $('pre code').each(function (i, block) {
                        hljs.highlightBlock(block);
                    });

                },
                error: function (xhr, status, error) {
                    alert(xhr.responseText);
                }

            });//end of ajax


        }//end of else
        
        

 

    });


    $("#btn_fp_clone").click(function () {
        var doc_id = $("#doc_id").val();
        alert(doc_id);
    });



});