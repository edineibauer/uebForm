<div class="parent-input {$form['class']}" {$form['atributos']} style="{$form['style']}">
    <div>{$nome} {($default === false) ? "*" : ""}</div>
    {foreach key=key item=item from=$allow['values']}
        <label class="col s12">
            <input type="checkbox" data-model="{$ngmodel}" value="{$item}"
                    {($key == 0)? "id='{$ngmodel}' data-format='checkbox' " : ''}
                    {($value && $item|in_array:$value) ? "checked='checked' " : "" }
                    {($size !== false)? "maxlength='{$size}' " : ''}
                    {($disabled)? "disabled='disabled' " : ''}
                    {($default === false)? 'required="required" ' : ''} />
            <div class="font-large padding-medium pointer">{$allow['names'][$key]}</div>
        </label>
    {/foreach}
</div>
