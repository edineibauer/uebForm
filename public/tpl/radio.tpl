<div class="col"><br></div>
<div class="parent-input {$form['class']}" {$form['atributos']} style="{$form['style']}">
    <div class="radio-title">{$nome} {($default === false) ? "*" : ""}</div>
    {foreach key=key item=item from=$allow['values']}
        <label class="md-radio left">
            <input type="radio" name="{$ngmodel}" data-model="{$ngmodel}" value="{$item}"
                    {($key == 0)? "id='{$ngmodel}' data-format='radio'" : ''}
                    {($disabled)? "disabled='disabled' " : ''}
                    {($value != "" && $item == $value) ? "checked='checked' " : "" } />
            <span class="md-radio--fake">
                <span></span>
            </span>
            <div class="left">
                {$allow['names'][$key]}
            </div>
        </label>
    {/foreach}
</div>