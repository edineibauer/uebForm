<div class="{$form['class']} parent-input row" {$form['atributos']} style="{$form['style']}">
    <label for="{$column}"
           class="col padding-4 color-text-grey font-small">{$nome} {($default === false) ? "*" : ""}</label>
    <div class="col radius border" style="background: rgba(200,200,200, 0.1);">
        <input type="hidden" class="idsCheckboxMult" data-model="{$ngmodel}" id="{$entity}-{$column}" data-format="checkbox_mult"
                {($value)? "value='{$value|json_encode}'" : ''} />
        <div class="container checkboxmult-content">
            {if $allow['values']}
                {foreach key=key item=item from=$allow['values']}
                    <label class="left padding-medium">
                        <input type="checkbox" value="{$item}" class="checkboxmult"
                                {($key == 0)? "id='{$ngmodel}' data-format='checkbox' " : ''}
                                {($value && $item|in_array:$value) ? "checked='checked' " : "" }
                                {($size !== false)? "maxlength='{$size}' " : ''}
                                {($disabled)? "disabled='disabled' " : ''}
                                {($default === false)? 'required="required" ' : ''} />
                        <div class="font-large padding-small padding-8 pointer left">{$allow['names'][$key]}</div>
                    </label>
                {/foreach}
            {/if}
        </div>
    </div>
</div>