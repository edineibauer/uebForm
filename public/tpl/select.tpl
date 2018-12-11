<div class="parent-input {$form['class']}" {$form['atributos']} style="{$form['style']}">
    <label class="col">
        <span class="col">{$nome} {($default === false) ? "*" : ""}</span>
        <select data-model="{$ngmodel}" id="{$ngmodel}" data-format="select"
                {($default === false)? 'required="required" ' : ''}
                {($disabled)? "disabled='disabled' " : ''}>
            <option value="0" {(!$value || ($value && $value != "")) ? "selected='selected' " : ""}disabled="disabled">
                selecione
            </option>
            {foreach key=key item=item from=$allow['values']}
                <option {($value && $value == $item) ? "selected='selected' " : ""}value="{$item}">{$allow['names'][$key]}</option>
            {/foreach}
        </select>
    </label>
</div>
