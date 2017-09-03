$(function () {
    $("#usual1 ul").idTabs();

    //mobile
    $('.tabs-item').on('click', function () {
        $(".tabs-item").removeClass("tabs-item-current");
        var $this = $(this);
        $this.addClass("tabs-item-current");
        $(".content-item").addClass("hide");
        $("#" + this.dataset.page).removeClass("hide");
    });

    jQuery.validator.addMethod("check_password", function (value, element) {
        return this.optional(element) || checkStrong(value);
    }, $.validator.messages['check_password']);

    jQuery.validator.addMethod('check_username', function (value, element) {
        return this.optional(element) || checkUserNameStrong(value);
    }, '字母或数字！');

    jQuery.validator.addMethod('check_usertel', function (value, element) {
        return this.optional(element) || checkUserTel(value);
    }, '手机号码格式不正确！');

    //////////////////////////////////////////////////////////////////////
    //密码检测密码强度
    //////////////////////////////////////////////////////////////////////
    function checkStrong(sValue) {
        var modes = 0;
        //正则表达式验证符合要求的
        if (sValue.length < 1) return modes;
        if (/\d/.test(sValue)) modes++; //数字
        if (/[a-zA-Z]/.test(sValue)) modes++; //小写
        //if (/[A-Z]/.test(sValue)) modes++; //大写
        if (/\W/.test(sValue)) modes++; //特殊字符
        if (modes >= 2) {
            return true;
        }
        return false;
    }

    function checkUserNameStrong(name) {
        return /^[a-zA-Z0-9]+$/.test(name);
    }

    function checkUserTel(tel) {
        return /^1\d{10}$/.test(tel);
    }

    //新开农场
    $("#form1").validate(
        {
            rules: {
                textUserId: {required: true, check_username: true, minlength: 6, maxlength: 16},
                txtUserMobile: {minlength: 5, maxlength: 11, check_usertel: true},
                //textFirstPassword: { required:true, minlength: 6, maxlength: 20},
                //txtConfirmFirstPassword: { required: true, minlength: 6, maxlength: 20, equalTo: "#textFirstPassword" },
                //txtSecondPassword: { required:true, minlength: 6, maxlength: 20 },
                //txtConfirmSecondPassword: { required: true, minlength: 6, maxlength: 20, equalTo: "#txtSecondPassword" },
                txtIdCardNumber: {maxlength: 18},
                txtAnswer: {maxlength: 50},
                txtAlipay: {maxlength: 50},
                txtWxNumber: {maxlength: 50},
                txtRemark: {maxlength: 200},
            },
            submitHandler: function(form) {
                // form.submit();
                $.ajax({
                    'url': form.action,
                    'type': 'post',
                    'data': $(form).serialize(),
                    'dataType': 'json',
                    'success': function (data) {
                        if (!data) return;

                        if (data.ret == -200) {
                            alert("您二级密码有效期已失效，请重新打开当前窗口！");
                            return;
                        }

                        var message = data.msg;
                        if (data.ret) {
                            var tipMsg = "\n\n新开农场信息：\n";
                                tipMsg += "推荐人：" + form.textRecommendUserId.value + "\n";
                                tipMsg += "新农场用户名：" + form.textUserId.value + "\n";
                                tipMsg += "姓名：" + form.txtUserName.value + "\n";
                                tipMsg += "手机号码：" + form.txtUserMobile.value + "\n";
                                // tipMsg += "扣除金币数：" + $(form).find('#lbNeedAppleNumber').text() + "\n";

                            message += tipMsg;
                        }

                        alert(message);

                        if (data.ret == 1) {
                            window.location.reload(true);
                        }
                    }
                });

                return false;
            }
        }
    );

    //批量添加
    $("#form2").validate(
        {
            rules: {
                textUserId: {required: true, check_username: true, minlength: 6, maxlength: 16},
                txtUserMobile: {minlength: 5, maxlength: 11, check_usertel: true},
                txtIdCardNumber: {maxlength: 18},
                txtAnswer: {maxlength: 50},
                txtAlipay: {maxlength: 50},
                txtWxNumber: {maxlength: 50},
                txtRemark: {maxlength: 200},
            }
        }
    );

    $("body").on("click", "a[rel='trDel']", function () {
        var id = $(this).data('id');
        $("#tr_" + id).remove();
        updateBatchTotalNeedNumber();
    });

    $("#addNewOwn").click(function () {
        var valid = $("#form2").valid();
        if (valid) {
            var textRecommendUserId = $("#form2").find('#textRecommendUserId').val();
            var textUserId = $("#form2").find('#textUserId').val();
            var txtUserName = $("#form2").find('#txtUserName').val();
            var txtUserMobile = $("#form2").find('#txtUserMobile').val();
            var dpGender = $("#form2").find('#dpGender').val();
            var txtAlipay = $("#form2").find('#txtAlipay').val();
            var txtWxNumber = $("#form2").find('#txtWxNumber').val();

            var trId = 'tr_' + textUserId;
            if ($("#" + trId).length > 0) {
                alert('已经添加该农场用户，请不要重复添加！');
                return false;
            }

            //remote check
            $.ajax({
                'url': '/farm/checknewfarmparam',
                'type': 'post',
                'data': $('#form2').serialize(),
                'dataType': 'json',
                'success': function (data) {
                    if (!data) return;

                    if (data.ret == -200) {
                        alert("您二级密码有效期已失效，请重新打开当前窗口！");
                        return;
                    }

                    var message = data.msg;
                    if (data.ret == 0) {
                        alert(message);
                    } else {
                        var tr = buildNewTrRow(textRecommendUserId, textUserId, txtUserName, txtUserMobile, dpGender, txtAlipay, txtWxNumber);
                        $("#formTbody").append(tr);

                        //更新显示所需金币数
                        updateBatchTotalNeedNumber();

                        $("#liBatchNeedTip").show();
                        $("#liBatchSave").show();

                        resetAddForm();
                    }
                }
            });
        }
    });

    $("#batchSave").click(function () {
        if (window.confirm("请检查批量添加的会员信息是否正确！\n确定要提交吗？")) {
            var totalCount = parseInt($('tr[id^="tr_"]').length);
            if (totalCount == 0) {
                alert('请先添加农场信息！');
                return false;
            }

            var action = $("#form2").data('batchaction');
            var data = $("#form2").serialize();
            $.ajax({
                'url': action,
                'type': 'post',
                'data': data,
                'dataType': 'json',
                'success': function (data) {
                    if (!data) return;

                    if (data.ret == -200) {
                        alert("您二级密码有效期已失效，请重新打开当前窗口！");
                        return;
                    }

                    var message = data.msg;
                    alert(message);

                    if (data.ret == 1) {
                        window.location.reload(true);
                    }
                }
            });
        }
    });

    $("#batchImport").change(function () {
       if ($(this).val()) {
           var file = this.files[0];
           var name = file.name;
           var size = file.size;
           var type = file.type;

           // console.log(file, name, size, type);
           if (size == 0) {
               alert('请检查选择导入的文件内容！');
               return false;
           }

           if (type != 'text/plain') {
               alert('请检查选择导入的文件类型！只支持TXT文件！');
               return false;
           }

           $("#importForm").submit();
           $(this).val(null);
       }
    });

    $("#importForm").submit(function (event) {
        event.preventDefault();

        $.ajax({
            url: $(this).attr("action"),
            type: $(this).attr("method"),
            dataType: "JSON",
            data: new FormData(this),
            processData: false,
            contentType: false,
            success: function (data, status)
            {
                if (!data) return;

                if (data.ret == -200) {
                    alert("您二级密码有效期已失效，请重新打开当前窗口！");
                    return;
                }

                var message = data.msg;
                alert(message);
                if (data.ret == 1) {
                    var total = data.total;
                    var list = data.datas;

                    //清空旧数据
                    clearBatchList();

                    $.each(list, function(i, row) {
                        tr = buildNewTrRow(row[0], row[1], row[2], row[3], row[4] == '男' ? 1 : 2, row[5], row[6]);
                        $("#formTbody").append(tr);
                    });

                    // 更新显示所需金币数
                    updateBatchTotalNeedNumber();

                    $("#liBatchNeedTip").show();
                    $("#liBatchSave").show();
                }
            },
            error: function (xhr, desc, err)
            {

            }
        });
    });
});

/**
 * 清空旧的批量数据
 */
function clearBatchList() {
    $("tr[id^='tr_']").remove();
    updateBatchTotalNeedNumber();
}

/**
 * 重置添加表单
 */
function resetAddForm() {
    // if ($("#form2").find('#textRecommendUserId').attr('disabled') == undefined) {
    //     $("#form2").find('#textRecommendUserId').val(null);
    // }
    $("#form2").find('#textUserId').val(null);
    $("#form2").find('#txtUserName').val(null);
    $("#form2").find('#txtUserMobile').val(null);
    $("#form2").find('#dpGender').val(1);
    $("#form2").find('#txtAlipay').val(null);
    $("#form2").find('#txtWxNumber').val(null);
}

/**
 * 更新批量需要数量
 */
function updateBatchTotalNeedNumber() {
    var totalCount = parseInt($('tr[id^="tr_"]').length);

    var lbl = $("#lbBatchNeedAppleNumber");
    var count = parseInt(totalCount);
    var oneNeed = parseInt($("#lbNeedAppleNumber").text());
    var batchAddFee = parseInt($("#batchAddFee").val());

    var total = count * oneNeed + Math.ceil(count/10) * batchAddFee;
    lbl.text(total);
}

function buildNewTrRow(rUId, uId, uName, uMobile, gender, alipay, wxNum) {
    var trId = 'tr_' + uId;
    var dpGenderTxt = gender == 1 ? "男" : "女";
    var tr = "<tr id='"+trId+"'>\
                <td>"+rUId+" <input type='hidden' name='bRecUserId[]' value='"+rUId+"'/></td>\
                <td>"+uId+"<input type='hidden' name='bUserId[]' value='"+uId+"'/></td>\
                <td>"+uName+"<input type='hidden' name='bUserName[]' value='"+uName+"'/></td>\
                <td>"+uMobile+"<input type='hidden' name='bUserMobile[]' value='"+uMobile+"'/></td>\
                <td>"+dpGenderTxt+"<input type='hidden' name='bGender[]' value='"+gender+"'/></td>\
                <td>"+alipay+"<input type='hidden' name='bAlipay[]' value='"+alipay+"'/></td>\
                <td>"+wxNum+"<input type='hidden' name='bWxNum[]' value='"+wxNum+"'/></td>\
                <td><a rel='trDel' data-id='"+uId+"' href='#'>删除</a></td>\
                </tr>";

    return tr;
}