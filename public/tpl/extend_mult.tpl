<div class="{$form['class']} parent-input parent-relation" {$form['atributos']} style="{$form['style']}">
    <div class="row list_mult_input border-bottom radius border" style="background: rgba(200,200,200, 0.1);">

        <div class="buttonExtenContainer padding-4 right">
            <button class="btn btnRelation margin-right opacity hover-opacity-off theme-d2 extendButton hover-shadow margin-0 right list-{$relation}"
                    style="margin-right:5px!important"
                    {($disabled)? "disabled='disabled' " : ''}
                    data-entity="{$relation}" data-fields='{$form['fields']|@json_encode}'
                    data-defaults='{$form['defaults']|@json_encode}' data-autosave="{$autosave}">
                <i class="material-icons">add</i>
            </button>

            <input type="hidden" data-model="{$ngmodel}" id="{$entity}-{$column}" data-format="extend_mult"
                    {($value)? "value='[{foreach item=id key=i from=$value}{if $i > 1},{/if}{$id.id}{/foreach}]'" : ''} />
        </div>
        <div class="left color-text-grey padding-12 container upper relative rest">
            {$nome}
        </div>

        <div class="tpl_div_new_mult hide" rel="mult"></div>

        <div class="col listmult-content">
            {if $value}
                {foreach item=data key=i from=$value}
                    <div class="listmult-card col" style="border-top: solid 2px #DDD;padding:0 5px" rel="{$data.id}">
                        <div class="col padding-small container" style="width:30px">
                            <i class="material-icons padding-8">{$icon}</i>
                        </div>
                        <div class="rest relative" style="padding-top:4px">
                            <div class="right" style="width: 170px; height: 45px">
                                <button id="{$entity}-{$column}-btn"
                                        onclick="editListMult('{$relation}', '#{$entity}-{$column}', {$data.id})"
                                        class="btn btnRelation hover-shadow padding-medium color-white opacity hover-opacity-off editListMult">
                                    <i class="material-icons transition-ease-25 left">edit</i>
                                    <span class="editListMultSpan" style="padding-left:10px">editar</span>
                                </button>
                                <button onclick="removerListMult('#{$entity}-{$column}', {$data.id})"
                                        class="btn-floating color-hover-text-red hover-shadow color-white opacity hover-opacity-off margin-0 removerListMult">
                                    <i class="material-icons transition-ease-25">delete</i>
                                </button>
                            </div>
                            <div class="left container padding-8 font-light listmult-title">
                                {foreach key=k item=it from=$data.valores}
                                    <small class="color-text-grey">{$k}:</small> {$it}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                {/foreach}
                            </div>
                        </div>
                    </div>
                {/foreach}
            {/if}
        </div>

        <div class="tpl_list_mult hide listmult-card col" style="border-top: solid 2px #DDD;padding:0 5px" rel="__$0__">
            <div class="col padding-small container" style="width:30px">
                <i class="material-icons padding-8">{$icon}</i>
            </div>
            <div class="rest relative" style="padding-top:4px">
                <div class="right" style="width: 170px; height: 45px">
                    <button id="{$entity}-{$column}-btn"
                            onclick="editListMult('{$relation}', '#{$entity}-{$column}', __$0__)"
                            class="btn btnRelation hover-shadow padding-medium color-white opacity hover-opacity-off editListMult">
                        <i class="material-icons transition-ease-25 left">edit</i>
                        <span class="editListMultSpan" style="padding-left:10px">editar</span>
                    </button>
                    <button onclick="removerListMult('#{$entity}-{$column}', __$0__)"
                            class="btn-floating color-hover-text-red hover-shadow color-white opacity hover-opacity-off margin-0 removerListMult">
                        <i class="material-icons transition-ease-25">delete</i>
                    </button>
                </div>
                <div class="left container padding-8 font-light listmult-title">__$1__</div>
            </div>
        </div>
    </div>
</div>