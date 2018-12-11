<div class="{$form['class']} parent-input row" {$form['atributos']} style="{$form['style']}">
    <label for="{$column}" class="col padding-4 color-text-grey font-small">
        {$nome} {($default === false) ? "*" : ""}
    </label>
    <div class="col radius border" style="background: rgba(200,200,200, 0.1);">
        <div class="hide buttonExtenContainer">
            <input type="hidden" data-model="{$ngmodel}" id="{$entity}-{$column}" data-format="selecao_mult"
                    {($value)? "value='[{foreach item=id key=i from=$value}{if $i > 1},{/if}{$id.id}{/foreach}]'" : ''} />
        </div>
        <div class="col s12 container relative padding-0">
            <input type="text" placeholder="pesquisar..." autocomplete="off" id="{$column}"
                    {($size !== false)? "maxlength='{$size}' " : ''}
                    {($default === false)? 'required="required" ' : ''}
                    {($disabled)? "disabled='disabled' " : ''}
                   data-entity="{$relation}" data-parent="{$entity}"
                   class="form-list rest"/>
            <div class="col s12 list-complete" rel="mult"></div>
        </div>

        <div class="col listmult-content">
            {if $value}
                {foreach item=data key=i from=$value}
                    <div class="listmult-card col" style="border-top: solid 2px #EEE;padding:0 5px" rel="{$data.id}">
                        <div class="col padding-small container" style="width:30px">
                            <i class="material-icons padding-8">{$icon}</i>
                        </div>
                        <div class="rest relative" style="padding-top:4px">
                            <div class="right" style="width: 45px; height: 45px">
                                <button onclick="removerListMult('#{$entity}-{$column}', {$data.id})"
                                        class="btn-floating color-white color-hover-text-red hover-shadow opacity hover-opacity-off">
                                    <i class="material-icons">delete</i>
                                </button>
                            </div>
                            <div class="left container padding-medium listmult-title">
                                {foreach key=k item=it from=$data.valores}
                                    <small class="color-text-grey">{$k}:</small> {$it}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                {/foreach}
                            </div>
                        </div>
                    </div>
                {/foreach}
            {/if}
        </div>

        <div class="tpl_list_mult hide listmult-card col" style="border-top: solid 2px #EEE;padding:0 5px" rel="__$0__">
            <div class="col padding-small container" style="width:30px">
                <i class="material-icons padding-8">{$icon}</i>
            </div>
            <div class="rest relative" style="padding-top:4px">
                <div class="right" style="width: 45px; height: 45px">
                    <button onclick="removerListMult('#{$entity}-{$column}', __$0__)"
                            class="btn-floating color-white color-hover-text-red hover-shadow opacity hover-opacity-off">
                        <i class="material-icons">delete</i>
                    </button>
                </div>
                <div class="left container padding-medium listmult-title">__$1__</div>
            </div>
        </div>
    </div>
</div>