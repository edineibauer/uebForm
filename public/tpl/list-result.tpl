<ul class="col s12 card list-result-itens">
    {foreach key=key item=v from=$data}
        <li rel="{$v['id']}" class="list-option col s12 font-light container padding-medium hover-opacity-off pointer opacity{($key == 0) ? " active" : ""}">
            {foreach key=k item=i from=$fields}
                <small class="color-text-grey">{$i[1]}:</small> {$v[$i[0]]}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            {/foreach}
        </li>
    {/foreach}
</ul>